import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
import { PushModule } from './push/push.module';
import { RemindersModule } from './reminders/reminders.module';
import { EmergencyContactsModule } from './emergency-contacts/emergency-contacts.module';
import { WeeklyReportsModule } from './weekly-reports/weekly-reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    MedicationsModule,
    DashboardModule,
    SupabaseAdminModule,
    SubscriptionsModule,
    FamilyMembersModule,
    WhatsAppModule,
    PushModule,
    RemindersModule,
    EmergencyContactsModule,
    WeeklyReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
