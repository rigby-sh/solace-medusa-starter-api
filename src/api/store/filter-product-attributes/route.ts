import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const knex = req.scope.resolve("__pg_connection__");

  const [collection, type, material] = await Promise.all([
    knex("product_collection")
      .select("id", "title as value")
      .whereNull("deleted_at"),
    knex("product_type").select("id", "value").whereNull("deleted_at"),
    knex("product")
      .distinct("material")
      .whereNotNull("material")
      .whereNull("deleted_at")
      .pluck("material"),
  ]);

  res.json({
    collection,
    type,
    material: material.map((v) => ({ id: v, value: v })),
  });
};
