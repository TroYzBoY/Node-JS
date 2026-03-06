const swaggerJSDoc = require("swagger-jsdoc");

const definition = {
  openapi: "3.0.3",
  info: {
    title: "Capstone E-Commerce API",
    version: "1.0.0",
    description: "REST API documentation for Capstone backend",
  },
  servers: [
    { url: "http://localhost:5000/api/v1", description: "HTTP" },
    { url: "https://localhost:5443/api/v1", description: "HTTPS" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Product not found" },
          requestId: { type: "string", nullable: true },
        },
      },
    },
  },
  paths: {
    "/auth/register": { post: { summary: "Register user", tags: ["Auth"], responses: { "201": { description: "Created" } } } },
    "/auth/login": { post: { summary: "Login user", tags: ["Auth"], responses: { "200": { description: "OK" } } } },
    "/auth/me": { get: { summary: "Current user", tags: ["Auth"], security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    "/auth/google": { get: { summary: "Google OAuth login", tags: ["Auth"], responses: { "302": { description: "Redirect" } } } },
    "/auth/google/callback": { get: { summary: "Google OAuth callback", tags: ["Auth"], responses: { "200": { description: "JWT response" } } } },
    "/products": {
      get: { summary: "List products", tags: ["Products"], responses: { "200": { description: "OK" } } },
      post: { summary: "Create product", tags: ["Products"], security: [{ bearerAuth: [] }], responses: { "201": { description: "Created" } } },
    },
    "/products/{id}": {
      get: { summary: "Get product by id", tags: ["Products"], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" }, "404": { description: "Not Found" } } },
      patch: { summary: "Update product", tags: ["Products"], security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } },
      delete: { summary: "Delete product", tags: ["Products"], security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } },
    },
    "/categories": {
      get: { summary: "List categories", tags: ["Categories"], responses: { "200": { description: "OK" } } },
      post: { summary: "Create category", tags: ["Categories"], security: [{ bearerAuth: [] }], responses: { "201": { description: "Created" } } },
    },
    "/cart": { get: { summary: "Get my cart", tags: ["Cart"], security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    "/cart/items": { post: { summary: "Add cart item", tags: ["Cart"], security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    "/cart/items/{id}": {
      patch: { summary: "Update cart item", tags: ["Cart"], security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } },
      delete: { summary: "Delete cart item", tags: ["Cart"], security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } },
    },
    "/orders": {
      post: { summary: "Create order from cart", tags: ["Orders"], security: [{ bearerAuth: [] }], responses: { "201": { description: "Created" } } },
      get: { summary: "Get my orders", tags: ["Orders"], security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
    },
    "/orders/{id}": { get: { summary: "Get one order", tags: ["Orders"], security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
    "/admin/users": { get: { summary: "Admin users", tags: ["Admin"], security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    "/admin/orders": { get: { summary: "Admin orders", tags: ["Admin"], security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } } },
    "/admin/orders/{id}/status": { patch: { summary: "Admin update order status", tags: ["Admin"], security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], responses: { "200": { description: "OK" } } } },
  },
};

const swaggerSpec = swaggerJSDoc({ definition, apis: [] });

module.exports = swaggerSpec;
