import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';

@Processor('notification')
export class NotificationProcessor {
  constructor(private readonly mailerService: MailerService) {}

  @Process('send-schedule-email')
  async handleSendScheduleEmail(job: Job<any>) {
    const { to, subject, type, customerName, doctorName, scheduledAt, objective } = job.data;
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        html: `
          <h3>${subject}</h3>
          <p>Halo <b>${customerName}</b>,</p>
          <p>${type === 'CREATE' ? 'Jadwal konsultasi Anda telah berhasil dibuat:' : 'Jadwal konsultasi Anda telah dibatalkan:'}</p>
          <ul>
            <li><b>Dokter:</b> ${doctorName}</li>
            <li><b>Waktu:</b> ${scheduledAt}</li>
            <li><b>Tujuan:</b> ${objective}</li>
          </ul>
          <p>Terima kasih,</p>
          <p>Healthcare Scheduling System</p>
        `,
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }
}
