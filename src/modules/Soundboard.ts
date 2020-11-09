import Enmap from "enmap";

export class Soundboard {
  private static started: number;
  private static repository: Enmap;

  static init(): void {
    this.repository = new Enmap({
      name: "soundboard",
      fetchAll: false,
      autoFetch: true,
    });
    this.started = Date.now();
    console.info(`[SOUNDBOARD] started at ${new Date(this.started).toISOString()}`);
  }

  static addSound(name: string, filename: string): boolean {
    if (this.repository.has(name)) return false;
    const result = this.repository.set(name, filename);
    if (result) return true;
    else return false;
  }

  static editSound(name: string, newName: string, newFilename?: string): boolean {
    if (this.repository.has(name)) {
      const oldFilename = this.repository.get(name) as string;
      this.repository.delete(name);
      const result = this.repository.set(newName, newFilename ? newFilename : oldFilename);
      if (result) return true;
      else return false;
    } else return false;
  }

  static removeSound(name: string): boolean {
    if (this.repository.has(name)) {
      const result = this.repository.delete(name);
      if (result) return true;
      else return false;
    } else return false;
  }
}
