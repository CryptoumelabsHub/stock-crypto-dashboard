import { z } from "zod"

export const priceAlertSchema = z.object({
  symbol: z.string().min(1, "Asset symbol is required"),
  targetPrice: z.number().min(0, "Target price must be greater than 0"),
  condition: z.enum(["ABOVE", "BELOW"], {
    required_error: "Please select a price condition",
  }),
  isActive: z.boolean().default(true),
})

export type PriceAlert = z.infer<typeof priceAlertSchema>

export const priceAlertFormSchema = priceAlertSchema.extend({
  targetPrice: z.string().min(1, "Target price is required").transform((val) => {
    const num = parseFloat(val)
    if (isNaN(num)) {
      throw new Error("Invalid price")
    }
    return num
  }),
})
