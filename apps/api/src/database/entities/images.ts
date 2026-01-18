import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Images {
    @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
    id!: string;

    @Property({ type: "string" })
    imageUrl!: string;

    @Property({ type: "string", nullable: true })
    aiDescription?: string;

    @Property({ type: "float[]", nullable: true })
    aiEmbedding?: number[];
}