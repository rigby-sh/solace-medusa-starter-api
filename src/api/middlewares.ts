import { defineMiddlewares } from "@medusajs/framework";
import { storeSearchRoutesMiddlewares } from "./store/search/middlewares";

export default defineMiddlewares([...storeSearchRoutesMiddlewares]);
