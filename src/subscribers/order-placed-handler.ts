import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import {
  INotificationModuleService,
  IOrderModuleService,
  OrderDTO,
} from "@medusajs/types";
import { MedusaError, Modules } from "@medusajs/framework/utils";
import { ResendNotificationTemplates } from "../modules/resend-notification/service";
import { processBigNumberFields } from "../utils/format-order";

/**
 * Subscribers that listen to the `order.placed` event.
 */
export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<Record<string, any>>) {
  const orderService: IOrderModuleService = container.resolve(Modules.ORDER);
  const notificationModuleService: INotificationModuleService =
    container.resolve(Modules.NOTIFICATION);

  let order: OrderDTO | null = null;

  order = await orderService.retrieveOrder(data.id, {
    relations: ["items", "shipping_methods", "shipping_address"],
    select: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "created_at",
      "items",
      "total",
      "shipping_address",
      "shipping_methods",
    ],
  });

  order = processBigNumberFields(order);

  const toEmail = order.email ?? process.env.TO_EMAIL;
  if (!toEmail) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Missing to_email in configuration."
    );
  }

  await notificationModuleService.createNotifications({
    to: toEmail,
    channel: "email",
    template: ResendNotificationTemplates.ORDER_PLACED,
    data: order as unknown as Record<string, unknown>,
  });
}

export const config: SubscriberConfig = {
  event: "order.placed",
};