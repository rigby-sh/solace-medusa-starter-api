const { loadEnv, defineConfig } = require("@medusajs/framework/utils");

const { Modules } = require("@medusajs/utils");

loadEnv(process.env.NODE_ENV, process.cwd());

const modules = {
  [Modules.FILE]: {
    resolve: "@medusajs/medusa/file",
    options: {
      providers: [
        {
          resolve: "@medusajs/file-s3",
          id: "s3",
          options: {
            file_url: process.env.DO_SPACE_URL,
            access_key_id: process.env.DO_SPACE_ACCESS_KEY,
            secret_access_key: process.env.DO_SPACE_SECRET_KEY,
            region: process.env.DO_SPACE_REGION,
            bucket: process.env.DO_SPACE_BUCKET,
            endpoint: process.env.DO_SPACE_ENDPOINT,
          },
        },
      ],
    },
  },
  [Modules.NOTIFICATION]: {
    resolve: "@medusajs/medusa/notification",
    options: {
      providers: [
        {
          resolve: "./modules/resend-notification",
          id: "resend-notification",
          options: {
            channels: ["email"],
            apiKey: process.env.RESEND_API_KEY,
            fromEmail: process.env.RESEND_FROM_EMAIL,
            replyToEmail: process.env.RESEND_REPLY_TO_EMAIL,
            toEmail: process.env.TO_EMAIL,
            enableEmails: process.env.ENABLE_EMAIL_NOTIFICATIONS,
          },
        },
      ],
    },
  },
};

module.exports = defineConfig({
  modules,
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    database_extra: { ssl: { rejectUnauthorized: false } },
    database_driver_options: {
      connection: { ssl: { rejectUnauthorized: false } },
    },
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    admin: {
      disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    },
  },
});
