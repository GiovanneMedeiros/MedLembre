import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { normalizePhoneDigits } from "../lib/phone";

interface SignUpInput {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  signUp: (input: SignUpInput) => Promise<{ needsEmailConfirmation: boolean }>;
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (novaSenha: string) => Promise<void>;
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
      }
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function signUp({ nome, email, telefone, senha }: SignUpInput) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome,
          whatsapp: telefone.trim() ? normalizePhoneDigits(telefone) : null,
        },
      },
    });

    if (error) throw error;

    return { needsEmailConfirmation: !data.session };
  }

  async function signIn(email: string, senha: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (error) throw error;
  }

  async function updatePassword(novaSenha: string) {
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) throw error;
  }

  function clearPasswordRecovery() {
    setIsPasswordRecovery(false);
  }

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    isLoading,
    isPasswordRecovery,
    signUp,
    signIn,
    signOut,
    requestPasswordReset,
    updatePassword,
    clearPasswordRecovery,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
