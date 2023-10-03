import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useActionData, useSubmit } from "@remix-run/react";
import { Page, Layout, Text, VerticalStack, Card, Button } from "@shopify/polaris";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export async function action({ request }) {
  try {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(
      `#graphql
        query {
          products(first: 20) {
            edges {
              node {
                id
                title
                handle
                status
                variants(first: 1) {
                  edges {
                    node {
                      id
                      price
                      barcode
                      createdAt
                    }
                  }
                }
              }
            }
          }
        }`
    );

    const responseJson = await response.json();

    return json({
      products: responseJson.data.products.edges.map((edge) => edge.node),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return json({ error: "Error fetching products" }, 500);
  }
}

export default function Index() {
  const actionData = useActionData();
  const submit = useSubmit();

  useEffect(() => {
    if (actionData?.products) {
      console.log("Products:", actionData.products);
    }
  }, [actionData]);

  const generateProduct = () => submit({}, { replace: true, method: "POST" });

  return (
    <Page>
      <VerticalStack gap="5">
        <Layout>
          <Layout.Section>
            <Card>
              <VerticalStack gap="5">
                <VerticalStack gap="2">
                  <Text as="h2" variant="headingMd">
                    Congrats on creating a new Shopify app 🎉
                  </Text>
                  <Text variant="bodyMd" as="p">
                    {/* ... (rest of your content) */}
                  </Text>
                </VerticalStack>
                <VerticalStack gap="2">
                  <Text as="h3" variant="headingMd">
                    Get started with products
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {/* ... (rest of your content) */}
                  </Text>
                </VerticalStack>
                <Button primary onClick={generateProduct}>
                  Generate a product
                </Button>
                {actionData?.products && (
                  <VerticalStack gap="3">
                    {actionData.products.map((product) => (
                      <Card key={product.id}>
                        <Text as="h3" variant="headingMd">
                          {product.title}
                        </Text>
                        <Text variant="bodyMd">ID: {product.id}</Text>
                        <Text variant="bodyMd">Handle: {product.handle}</Text>
                        <Text variant="bodyMd">Status: {product.status}</Text>
                        <Text variant="bodyMd">Price: {product.variants.edges[0].node.price}</Text>
                      </Card>
                    ))}
                  </VerticalStack>
                )}
              </VerticalStack>
            </Card>
          </Layout.Section>
          {/* ... (rest of your layout) */}
        </Layout>
      </VerticalStack>
    </Page>
  );
}


