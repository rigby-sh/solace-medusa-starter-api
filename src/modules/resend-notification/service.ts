import { ProviderSendNotificationDTO } from '@medusajs/types';
import { AbstractNotificationProviderService, MedusaError } from '@medusajs/utils';

import { Resend } from 'resend';

import { validateModuleOptions } from '../../utils/validate-module-options';
import { OrderPlacedEmailTemplate } from './email-templates/order-placed';

type ModuleOptions = {
  apiKey: string;
  fromEmail: string;
  replyToEmail: string;
  toEmail: string;
  enableEmails: string;
};

export enum ResendNotificationTemplates {
  ORDER_PLACED = 'order-placed'
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  private resend: Resend;
  private options: ModuleOptions;

  constructor(container, options: ModuleOptions) {
    super();
    validateModuleOptions(options, 'resendNotificationProvider');

    this.resend = new Resend(options.apiKey);
    this.options = options;
  }

  // Send mail
  private async sendMail(subject: string, body: any, toEmail?: string) {
    if (this.options.enableEmails.toLowerCase() !== 'true') {
      return {};
    }

    const { data, error } = await this.resend.emails.send({
      from: this.options.fromEmail,
      replyTo: this.options.replyToEmail,
      to: [toEmail ? toEmail : this.options.toEmail],
      subject: subject,
      react: body
    });

    if (error) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error.message);
    }

    return data!;
  }

  // Send order placed mail
  private async sendOrderPlacedMail(notification: ProviderSendNotificationDTO) {
    const orderData = { order: notification?.data };
    const dynamicSubject = notification?.data?.subject as string;

    return await this.sendMail(
      dynamicSubject,
      OrderPlacedEmailTemplate({ data: orderData }),
      notification.to
    );
  }

  async send(notification: ProviderSendNotificationDTO) {
    switch (notification.template) {
      case ResendNotificationTemplates.ORDER_PLACED.toString():
        return await this.sendOrderPlacedMail(notification);
    }

    return {};
  }
}

export default ResendNotificationProviderService;
