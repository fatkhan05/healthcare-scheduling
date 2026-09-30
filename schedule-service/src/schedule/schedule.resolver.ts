import { Args, ID, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ScheduleService } from './schedule.service';
import { CustomerService } from '../customer/customer.service';
import { DoctorService } from '../doctor/doctor.service';
import { Schedule } from './models/schedule.model';
import { SchedulePaginationResult } from './models/schedule-pagination.model';
import { CreateScheduleInput } from './dto/create-schedule.input';
import { ScheduleFilterInput } from './dto/schedule-filter.input';
import { Customer } from '../customer/models/customer.model';
import { Doctor } from '../doctor/models/doctor.model';

@Resolver(() => Schedule)
export class ScheduleResolver {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly customerService: CustomerService,
    private readonly doctorService: DoctorService,
  ) {}

  @Query(() => SchedulePaginationResult, { description: 'Mendapatkan daftar jadwal dengan paginasi dan filter' })
  async schedules(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('filter', { nullable: true }) filter?: ScheduleFilterInput,
  ): Promise<SchedulePaginationResult> {
    return this.scheduleService.findAll(page, limit, filter);
  }

  @Query(() => Schedule, { description: 'Mendapatkan detail jadwal berdasarkan ID' })
  async schedule(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Schedule> {
    return this.scheduleService.findOne(id);
  }

  @Mutation(() => Schedule, { description: 'Membuat jadwal baru' })
  async createSchedule(
    @Args('input') input: CreateScheduleInput,
  ): Promise<Schedule> {
    return this.scheduleService.create(input);
  }

  @Mutation(() => Boolean, { description: 'Menghapus data jadwal' })
  async deleteSchedule(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.scheduleService.delete(id);
  }

  @ResolveField(() => Customer, { nullable: true, description: 'Mengambil data pelanggan terkait' })
  async customer(@Parent() schedule: Schedule): Promise<Customer> {
    return this.customerService.findOne(schedule.customerId);
  }

  @ResolveField(() => Doctor, { nullable: true, description: 'Mengambil data dokter terkait' })
  async doctor(@Parent() schedule: Schedule): Promise<Doctor> {
    return this.doctorService.findOne(schedule.doctorId);
  }
}
