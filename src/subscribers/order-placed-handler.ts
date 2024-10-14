import type { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa';
import { INotificationModuleService, IOrderModuleService, OrderDTO } from '@medusajs/types';
import { MedusaError, Modules } from '@medusajs/framework/utils';
import { ResendNotificationTemplates } from '../modules/resend-notification/service';
import { processBigNumberFields } from '../utils/format-order';

/**
 * Subscribers that listen to the `order.placed` event.
 */
export default async function orderPlacedHandler({
  event: { data },
  container
}: SubscriberArgs<OrderDTO>) {
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER);
  const notificationModuleService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  );

  const order: OrderDTO = await orderModuleService.retrieveOrder(data.id, {
    relations: ['items', 'shipping_methods', 'shipping_address'],
    select: [
      'id',
      'display_id',
      'email',
      'currency_code',
      'created_at',
      'items',
      'total',
      'shipping_address',
      'shipping_methods'
    ]
  });

  const processedOrder = processBigNumberFields(order);

  const toEmail = order.email ?? process.env.TO_EMAIL;
  if (!toEmail) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, 'Missing to_email in configuration.');
  }

  await notificationModuleService.createNotifications({
    to: toEmail,
    channel: 'email',
    template: ResendNotificationTemplates.ORDER_PLACED,
    data: {
      subject: `Your order #${processedOrder.display_id} has been placed!`,
      ...processedOrder,
    },
  });
}

export const config: SubscriberConfig = {
  event: 'order.placed'
};
