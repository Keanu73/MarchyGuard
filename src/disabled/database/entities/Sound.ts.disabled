import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

// on new message check if name is in soundboard repository?

@Entity()
export class Sound {
  @ObjectIdColumn()
  _id?: ObjectID;
  @Column()
  name: string;
  @Column()
  filename: string;
  @Column({ type: "timestamp", default: Date.now() })
  created_at: Date;
  @Column()
  playCount?: number;
  @Column()
  lastPlayedBy?: string;
}
