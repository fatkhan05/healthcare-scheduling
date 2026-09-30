import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleResolver } from './schedule.resolver';
import { CustomerModule } from '../customer/customer.module';
import { DoctorModule } from '../doctor/doctor.module';

@Module({
  imports: [CustomerModule, DoctorModule],
  providers: [ScheduleService, ScheduleResolver],
  exports: [ScheduleService],
})
export class ScheduleModule {}
