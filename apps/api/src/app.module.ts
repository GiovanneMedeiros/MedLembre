import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MedicationsModule } from './medications/medications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FamilyMembersModule } from './family-members/family-members.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SupabaseAdminModule } from './supabase-admin/supabase-admin.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    MedicationsModule,
    DashboardModule,
    SupabaseAdminModule,
    SubscriptionsModule,
    FamilyMembersModule,
    WhatsAppModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
