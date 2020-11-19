import { createConnection, Connection, getMongoRepository, MongoRepository } from "typeorm";
import * as fs from "fs/promises";
import * as Path from "path";
import { config } from "../../Config";
import { Sound } from "./entities/Sound";

// Connect to MongoDB database with TypeORM
// Statistics & Soundboard database modules - they interface with database and are able to be gotten.
// Soundboard commands - !play will get sound from Soundboard database, that directly fetches from the database and resolves the file as a stream to be played
// Statistics - !stats command will get logged statistics from Statistics table and the command will process them into an embed

export class Database {
  static connection: Connection;
  static sounds: MongoRepository<Sound>;

  static async initConnection(): Promise<Connection> {
    this.connection = await createConnection({
      name: "default",
      type: "mongodb",
      url: config.mongodb.url,
      database: "marchyguard",
      w: "majority",
      entities: [Sound],
      useUnifiedTopology: true,
    });

    this.sounds = getMongoRepository(Sound);

    return this.connection;
  }

  static get getConnection(): Connection {
    return this.connection;
  }

  static async importSounds(): Promise<boolean | undefined> {
    const dir = await fs.readdir(Path.join(__dirname, "..", "..", "..", "sounds"));
    if (dir) {
      console.log(dir);
      for (const filename of dir) {
        const name = filename.slice(0, -4);
        const sound = await this.sounds.findOne({ name });
        if (sound) break;
        this.sounds
          .insert({ name, filename })
          .then(() => {
            console.info(
              `[${new Date().getHours()}:${String(new Date().getMinutes()).padStart(
                2,
                "0",
              )}] Importing sound ${filename}`,
            );
          })
          .catch((err) => console.error(err));
      }
      return true;
    } else return undefined;
  }
}
