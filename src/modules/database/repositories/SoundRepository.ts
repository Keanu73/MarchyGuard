import { Sound } from "../entities/Sound";
import { Repository, UpdateResult, getRepository, DeleteResult } from "typeorm";

export class SoundRepository {
  private sounds: Repository<Sound>;
  constructor() {
    this.sounds = getRepository(Sound);
  }

  public async getSound(soundName: string): Promise<Sound | undefined> {
    return this.sounds.findOne({ name: soundName });
  }

  public createSound(name: string, filename: string): Sound | undefined {
    return this.sounds.create({ name, filename });
  }

  public async editSound(name: string, newName?: string, newFilename?: string): Promise<UpdateResult | boolean> {
    const sound = await this.getSound(name);
    if (sound) {
      if (newName && !newFilename) sound.name = newName;
      if (newFilename && !newName) sound.filename = newFilename;
      if (newName && newFilename) {
        sound.name = newName;
        sound.filename = newFilename;
      }
      return this.sounds.update({ name }, sound);
    } else return false;
  }

  public async removeSound(name: string): Promise<DeleteResult> {
    return this.sounds.delete({ name });
  }
}
