// Convert BigNumber fields to strings
export function processBigNumberFields(obj: any): any {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(processBigNumberFields);
  }

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "object" && value !== null && "numeric_" in value) {
      result[key] = value.numeric_;
    } else {
      result[key] = processBigNumberFields(value);
    }
  }
  return result;
}

export function formatPrice(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
