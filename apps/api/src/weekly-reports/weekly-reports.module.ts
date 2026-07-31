import { Module } from '@nestjs/common';
import { DashboardModule } from '../dashboard/dashboard.module';
import { EmailModule } from '../email/email.module';
import { SupabaseAdminModule } from '../supabase-admin/supabase-admin.module';
import { WeeklyReportScheduler } from './weekly-report.scheduler';

@Module({
  imports: [DashboardModule, EmailModule, SupabaseAdminModule],
  providers: [WeeklyReportScheduler],
})
export class WeeklyReportsModule {}
