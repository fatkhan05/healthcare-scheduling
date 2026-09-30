import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DoctorService } from './doctor.service';
import { Doctor } from './models/doctor.model';
import { DoctorPaginationResult } from './models/doctor-pagination.model';
import { CreateDoctorInput } from './dto/create-doctor.input';
import { UpdateDoctorInput } from './dto/update-doctor.input';

@Resolver(() => Doctor)
export class DoctorResolver {
  constructor(private readonly doctorService: DoctorService) {}

  @Query(() => DoctorPaginationResult, { description: 'Mendapatkan daftar dokter dengan paginasi' })
  async doctors(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<DoctorPaginationResult> {
    return this.doctorService.findAll(page, limit);
  }

  @Query(() => Doctor, { description: 'Mendapatkan detail dokter berdasarkan ID' })
  async doctor(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Doctor> {
    return this.doctorService.findOne(id);
  }

  @Mutation(() => Doctor, { description: 'Membuat data dokter baru' })
  async createDoctor(
    @Args('input') input: CreateDoctorInput,
  ): Promise<Doctor> {
    return this.doctorService.create(input);
  }

  @Mutation(() => Doctor, { description: 'Memperbarui data dokter' })
  async updateDoctor(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDoctorInput,
  ): Promise<Doctor> {
    return this.doctorService.update(id, input);
  }

  @Mutation(() => Boolean, { description: 'Menghapus data dokter' })
  async deleteDoctor(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.doctorService.delete(id);
  }
}
