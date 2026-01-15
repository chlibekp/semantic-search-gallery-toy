import { MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

import config from "./mikro-orm.config";

// Initialize singleton of MikroORM
const orm = await MikroORM.init<PostgreSqlDriver>(config);

export default orm;