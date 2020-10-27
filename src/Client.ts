import { Client } from "@typeit/discord";
import * as Path from "path";
import * as Sentry from "@sentry/node";
import { config } from "config";

export class Main {
  private static client: Client;

  static get Client(): Client {
    return this.client;
  }

  static start(): void {
    if (config.sentry.enabled) Sentry.init({ dsn: config.sentry.dsn });

    this.client = new Client();

    // In the login method, you must specify the glob string to load your classes (for the framework).
    // In this case that's not necessary because the entry point of your application is this file.
    this.client
      .login(
        config.token,
        Path.join(__dirname, "commands", "*.ts"), // glob string to load the classes
        Path.join(__dirname, "commands", "*.js"), // If you compile your bot, the file extension will be .js
      )
      .catch((err) => console.error(err));
  }
}

Main.start();
