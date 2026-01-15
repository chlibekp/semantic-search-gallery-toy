import { defineConfig } from "@mikro-orm/core";
import { Migrator } from "@mikro-orm/migrations";

// Import all db entities
import { Images } from "./entities/images.ts";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import env from "../util/env.ts";

const config = defineConfig({
    clientUrl: `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:5432/${env.POSTGRES_DB}`,
    entities: [Images],
    extensions: [Migrator],
    driver: PostgreSqlDriver,
    migrations: {
        path: "./src/database/migrations",
    }
})

export default config;