import { MiddlewareRoute } from "@medusajs/framework";
import { validateAndTransformQuery } from "@medusajs/framework";
import { StoreSearchProductsParams } from "./validators";
import { listProductQueryConfig } from "./query-config";

export const storeSearchRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/search",
    middlewares: [
      validateAndTransformQuery(
        StoreSearchProductsParams,
        listProductQueryConfig
      ),
    ],
  },
];
