import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Customer } from '../../customer/models/customer.model';
import { Doctor } from '../../doctor/models/doctor.model';

@ObjectType({ description: 'Model data jadwal konsultasi (schedule)' })
export class Schedule {
  @Field(() => ID, { description: 'ID unik jadwal' })
  id: string;

  @Field({ description: 'Tujuan atau deskripsi singkat konsultasi' })
  objective: string;

  @Field(() => ID, { description: 'ID pelanggan yang menjadwalkan' })
  customerId: string;

  @Field(() => ID, { description: 'ID dokter yang dituju' })
  doctorId: string;

  @Field({ description: 'Waktu pelaksanaan konsultasi' })
  scheduledAt: Date;

  @Field({ description: 'Waktu pembuatan data jadwal' })
  createdAt: Date;

  @Field({ description: 'Waktu pembaruan data jadwal terakhir' })
  updatedAt: Date;

  @Field(() => Customer, { nullable: true, description: 'Data pelanggan terkait' })
  customer?: Customer;

  @Field(() => Doctor, { nullable: true, description: 'Data dokter terkait' })
  doctor?: Doctor;
}
