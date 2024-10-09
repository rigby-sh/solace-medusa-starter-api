import { MedusaError } from "@medusajs/utils";

export const validateModuleOptions = (options, moduleName: string) => {
  for (const key in options) {
    if (!options[key]) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `No ${key} was provided in the ${moduleName} options. Please add one.`
      );
    }
  }
};
