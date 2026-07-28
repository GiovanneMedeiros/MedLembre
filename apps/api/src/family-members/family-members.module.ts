import { Module } from '@nestjs/common';
import { FamilyMembersController } from './family-members.controller';
import { FamilyMembersService } from './family-members.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule],
  controllers: [FamilyMembersController],
  providers: [FamilyMembersService],
})
export class FamilyMembersModule {}
