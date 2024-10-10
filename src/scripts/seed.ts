import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import { ExecArgs } from "@medusajs/framework/types";
import { faker } from "@faker-js/faker";
import { v4 } from "uuid";

function generateRandomProducts(count: number) {
  const products = [];

  for (let i = 0; i < count; i++) {
    const productTitle = faker.commerce.productName();
    const productDescription = faker.commerce.productDescription();
    const handle = v4();
    const weight = faker.number.int({ min: 100, max: 1000000 });
    const status = "published";

    // Generate product images
    const images = [{ url: faker.image.url() }, { url: faker.image.url() }];

    // Generate product options (size and color)
    const sizes = ["S", "M", "L", "XL"];
    const colors = ["Black", "White", "Red", "Blue", "Green"];

    const options = [
      {
        title: "Size",
        values: sizes,
      },
      {
        title: "Color",
        values: colors,
      },
    ];

    // Generate product variants
    const variants = [];
    sizes.forEach((size) => {
      colors.forEach((color) => {
        variants.push({
          title: `${size} / ${color}`,
          sku: v4(),
          options: {
            Size: size,
            Color: color,
          },
          prices: [
            {
              amount: parseInt(faker.commerce.price({ min: 1000, max: 5000 })),
              currency_code: "eur",
            },
            {
              amount: parseInt(faker.commerce.price({ min: 1000, max: 5000 })),
              currency_code: "usd",
            },
          ],
        });
      });
    });

    const product = {
      title: productTitle,
      description: productDescription,
      handle,
      weight,
      status,
      images,
      options,
      variants,
    };

    products.push(product);
  }

  return products;
}

export default async function seedDemoData({ container }: ExecArgs) {
  const products = generateRandomProducts(100);
  await createProductsWorkflow(container).run({
    input: {
      products,
    },
  });
}
