import { PackageManager } from "./package-manager";

export class BuilderCache {
  private _memcache: Record<string, Uint8Array | string> = {};
  private _packageManager = new PackageManager();

  get packageManager() {
    return this._packageManager;
  }

  get(key: string) {
    return this._memcache[key];
  }

  set(key: string, value: Uint8Array | string) {
    this._memcache[key] = value;
  }

  delete(key: string) {
    delete this._memcache[key];
  }

  clear() {
    this._memcache = {};
  }
}
