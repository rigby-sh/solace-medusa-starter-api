import { ExecArgs } from "@medusajs/framework/types";

export default async function enableSearchEngine({ container }: ExecArgs) {
  const knex = container.resolve("__pg_connection__");
  const logger = container.resolve("logger");

  /* Adding vector search column and index to product */
  await knex.raw(`
    ALTER TABLE product
    ADD COLUMN searchable_content tsvector;

    CREATE OR REPLACE FUNCTION update_searchable_content() RETURNS trigger AS $$
    BEGIN
      NEW.searchable_content :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.material, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(
          (SELECT string_agg(variant.title || ' ' || variant.sku, ' ')
           FROM product_variant variant
           WHERE variant.product_id = NEW.id), '')), 'D') ||
        setweight(to_tsvector('english', coalesce(
          (SELECT collection.title
           FROM product_collection collection
           WHERE collection.id = NEW.collection_id), '')), 'D') ||
        setweight(to_tsvector('english', coalesce(
          (SELECT product_type.value
           FROM product_type
           WHERE product_type.id = NEW.type_id), '')), 'D');

      RETURN NEW;
    END
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_searchable_content_trigger
    BEFORE INSERT OR UPDATE ON product
    FOR EACH ROW
    EXECUTE FUNCTION update_searchable_content();

    CREATE INDEX product_searchable_content_idx
    ON product
    USING GIN (searchable_content);
  `);

  logger.info("Search engine functionality has been successfully enabled.");
}
