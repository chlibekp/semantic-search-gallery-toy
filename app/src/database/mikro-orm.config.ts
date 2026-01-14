import { defineConfig } from "@mikro-orm/core";
import { Migrator } from "@mikro-orm/migrations";
import env from "../util/env";

// Import all db entities
import { Images } from "./entities/images";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

const config = defineConfig({
    clientUrl: `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:5432/${env.POSTGRES_DB}`,
    entities: [Images],
    extensions: [Migrator],
    driver: PostgreSqlDriver,
})

export default config;