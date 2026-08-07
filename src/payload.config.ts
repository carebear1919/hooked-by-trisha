import path from "path";
import { fileURLToPath } from "url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig, type Plugin } from "payload";
import sharp from "sharp";

import { Categories } from "./collections/Categories";
import { ContactMessages } from "./collections/ContactMessages";
import { Media } from "./collections/Media";
import { NewsletterSubscribers } from "./collections/NewsletterSubscribers";
import { NotificationLog } from "./collections/NotificationLog";
import { Orders } from "./collections/Orders";
import { Pages } from "./collections/Pages";
import { Products } from "./collections/Products";
import { Users } from "./collections/Users";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Local disk storage (see Media.ts staticDir) only survives on a persistent
// filesystem. Vercel's is ephemeral, so uploads there must go to Blob storage
// instead — enabled automatically once BLOB_READ_WRITE_TOKEN is set (Vercel
// injects this when a Blob store is attached to the project).
const plugins: Plugin[] = process.env.BLOB_READ_WRITE_TOKEN
  ? [
      vercelBlobStorage({
        collections: { media: true },
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }),
    ]
  : [];

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_APP_URL,
  routes: {
    admin: "/cms-admin",
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Products,
    Categories,
    Media,
    Orders,
    Pages,
    NotificationLog,
    ContactMessages,
    NewsletterSubscribers,
  ],
  globals: [SiteSettings],
  plugins,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? "dev-only-insecure-payload-secret",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  sharp,
});
