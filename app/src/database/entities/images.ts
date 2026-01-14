import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Images {
    @PrimaryKey({ type: "uuid", defaultRaw: "uuid_generate_v4()" })
    id!: string;

    @Property({ type: "string" })
    imageUrl!: string;
}