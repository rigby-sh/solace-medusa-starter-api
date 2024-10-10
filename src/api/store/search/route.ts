import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { StoreSearchProductsParamsType } from "./validators";
import { Knex } from "@mikro-orm/knex";

export const GET = async (
  req: MedusaRequest<StoreSearchProductsParamsType>,
  res: MedusaResponse
) => {
  const { limit, offset } = req.validatedQuery as StoreSearchProductsParamsType;

  const knex = req.scope.resolve("__pg_connection__");

  const engine = new SearchEngine(knex);

  const products = await engine.searchProducts(
    req.validatedQuery as StoreSearchProductsParamsType,
    req.listConfig.select
  );

  res.json({
    products: products.map(({ total_count, ...other }) => other),
    count: Number(products[0]?.total_count ?? 0),
    limit,
    offset,
  });
};

class SearchEngine {
  #connection: Knex<any, any[]>;
  #qb: Knex.QueryBuilder;

  constructor(connection: Knex<any, any[]>) {
    this.#connection = connection;
    this.#qb = connection.queryBuilder();
  }

  async searchProducts(
    params: StoreSearchProductsParamsType,
    select: string[]
  ) {
    this.buildBaseQuery(params.currency_code, select);
    this.applyFiltering(params);
    this.applySorting(params);
    this.applyPagination(params);

    return await this.#qb;
  }

  private applySorting({ order, q }: StoreSearchProductsParamsType) {
    if (order === "relevance") {
      if (q) {
        this.#qb.orderByRaw(
          "ts_rank(searchable_content, plainto_tsquery(?)) DESC",
          [q]
        );
      }
    } else {
      const sortingOrder = order.startsWith("-") ? "desc" : "asc";
      const orderBy = order.startsWith("-") ? order.slice(1) : order;

      this.#qb.orderBy(orderBy, sortingOrder);
    }
  }

  private applyPagination({ offset, limit }: StoreSearchProductsParamsType) {
    this.#qb.limit(limit).offset(offset);
  }

  private applyFiltering({
    q,
    collection_id,
    type_id,
    materials,
    category_id,
    price_from,
    price_to,
  }: StoreSearchProductsParamsType) {
    if (q) {
      this.#qb.whereRaw("searchable_content @@ plainto_tsquery(?)", [q]);
    }

    if (collection_id) {
      this.#qb.whereIn("product.collection_id", collection_id);
    }

    if (type_id) {
      this.#qb.whereIn("product.type_id", type_id);
    }

    if (materials) {
      this.#qb.whereIn("product.material", materials);
    }

    if (category_id) {
      this.#qb.whereIn("id", function () {
        this.select("product_category_product.product_id")
          .from("product_category_product")
          .whereIn("product_category_id", category_id);
      });
    }

    if (price_from) {
      this.#qb.where(
        this.#connection.raw(
          "COALESCE(price_data.sale_price, price_data.regular_price)"
        ),
        ">=",
        price_from
      );
    }

    if (price_to) {
      this.#qb.andWhere("price_data.max_price", "<=", price_to);
    }
  }

  private buildBaseQuery(currencyCode: string, select: string[]) {
    this.#qb
      .with("price_data", (qb) => {
        qb.select(
          "product_variant.product_id",
          this.#connection.raw(
            "MIN(CASE WHEN price_list.type = 'sale' THEN price.amount END) AS sale_price"
          ),
          this.#connection.raw(
            "MIN(CASE WHEN price.price_list_id IS NULL THEN price.amount END) AS regular_price"
          ),
          this.#connection.raw("MAX(price.amount) AS max_price")
        )
          .from("product_variant")
          .innerJoin(
            "product_variant_price_set",
            "product_variant_price_set.variant_id",
            "product_variant.id"
          )
          .innerJoin(
            "price_set",
            "price_set.id",
            "product_variant_price_set.price_set_id"
          )
          .innerJoin("price", function () {
            this.on("price.price_set_id", "=", "price_set.id").andOnIn(
              "price.currency_code",
              [currencyCode]
            );
          })
          .leftJoin("price_list", "price_list.id", "price.price_list_id")
          .whereNull("product_variant.deleted_at")
          .whereNull("product_variant_price_set.deleted_at")
          .whereNull("price_set.deleted_at")
          .whereNull("price.deleted_at")
          .groupBy("product_variant.product_id");
      })
      .select(
        ...select.map((sel) => `product.${sel}`),
        "price_data.regular_price",
        "price_data.sale_price",
        this.#connection.raw(
          "COALESCE(price_data.sale_price, price_data.regular_price) AS calculated_price"
        ),
        this.#connection.raw("COUNT(*) OVER() AS total_count")
      )
      .from("product")
      .leftJoin("price_data", "price_data.product_id", "product.id")
      .where("product.status", "=", "published")
      .whereNull("product.deleted_at");
  }
}
