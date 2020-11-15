import { createConnection, Connection } from "typeorm";
import { config } from "../../Config";

// Connect to MongoDB database with TypeORM
// Statistics & Soundboard database modules - they interface with database and are able to be gotten.
// Soundboard commands - !play will get sound from Soundboard database, that directly fetches from the database and resolves the file as a stream to be played
// Statistics - !stats command will get logged statistics from Statistics table and the command will process them into an embed

export class Database {
  static connection: Connection;

  static async initConnection(): Promise<void> {
    this.connection = await createConnection({
      type: "mongodb",
      url: config.mongodb.url,
      username: config.mongodb.username,
      password: config.mongodb.password,
      w: "majority",
      entities: ["./entities/(*.js|*.ts)"],
      useUnifiedTopology: true,
    });
  }

  static get getConnection(): Connection {
    return this.connection;
  }
}
