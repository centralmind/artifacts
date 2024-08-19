import { BuilderContext } from "./builder";
import { BuilderConstants } from "./builder-constants";
import { BuilderUtils } from "./builder-utils";

export interface PackageMetadata {
  name: string;
  version: string;
  manifest: PackageManifest;
  files: string[];
  subPackages: SubPackageMetadata[];
}

export interface SubPackageMetadata {
  path: string;
  manifest?: PackageManifest;
}

export interface PackageManifest {
  name: string;
  version: string;
  main?: string;
  module?: string;
  "umd:main"?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface PackageFileInfo {
  type: "file" | "directory";
  name: string;
  hash?: string;
  time?: string;
  size?: number;
  files?: PackageFileInfo[];
}

export class PackageManager {
  protected _dependencies: Record<string, string> = {};
  protected _packages: Record<string, PackageMetadata> = {};
  protected _paths = new Set<string>();

  get paths() {
    return this._paths;
  }

  get packages() {
    return this._packages;
  }

  async processPath(dependencies: Record<string, string>, path: string) {
    const { packageName, packagePath } = BuilderUtils.getPackageName(path);
    if (!packageName) {
      return null;
    }

    await this.loadPackage(dependencies, packageName, packagePath);
    const rewritePackagePath = this.rewrite(packageName, packagePath);

    return `/node_modules/${packageName}${rewritePackagePath}`;
  }

  private async loadPackage(dependencies: Record<string, string>, packageName: string, packagePath: string) {
    let current = this._packages[packageName];

    if (!current) {
      const version = dependencies[packageName] ?? this._dependencies[packageName] ?? "latest";
      const manifest = await this.getPackageManifest(packageName, version);
      const files = await this.getPackageFiles(packageName, manifest.version);

      const subPackages: SubPackageMetadata[] = [];
      for (const file of files) {
        const { base, fileName } = BuilderUtils.getFileName(file);

        if (base && fileName === "package.json") {
          subPackages.push({
            path: base,
          });
        }
      }

      current = {
        name: packageName,
        version: manifest.version,
        manifest,
        subPackages,
        files,
      };

      this._packages[packageName] = current;

      for (const path of files) {
        this._paths.add(`/node_modules/${packageName}${path}`);
      }
    }

    for (const subPackage of current.subPackages) {
      if (packagePath == subPackage.path) {
        if (!subPackage.manifest) {
          subPackage.manifest = await this.getPackageManifest(current.name, current.version, subPackage.path);
        }

        break;
      }
    }
  }

  private async getPackageManifest(
    packageName: string,
    version: string,
    relativePath: string = ""
  ): Promise<PackageManifest> {
    const basePath = `${BuilderConstants.CDN_BASE_NPM}/${packageName}@${version}`;
    const response = await fetch(`${basePath}${relativePath}/package.json`);

    if (!response.ok) {
      throw new Error(`Failed to fetch package "${packageName}@${version}"`);
    }

    const manifest = await response.json();
    this._dependencies[packageName] = manifest.version;

    if (manifest.dependencies) {
      for (const [name, version] of Object.entries(manifest.dependencies as Record<string, string>)) {
        this._dependencies[name] = version;
      }
    }

    return manifest;
  }

  private async getPackageFiles(packageName: string, version: string) {
    const files: string[] = [];
    const dataPath = `${BuilderConstants.CDN_BASE_DATA}/${packageName}@${version}`;
    const response = await fetch(dataPath);

    if (!response.ok) {
      throw new Error(`Failed to fetch package data for "${packageName}@${version}"`);
    }

    const data = await response.json();
    const traverse = (current: PackageFileInfo[], currentPath: string) => {
      for (const file of current) {
        const fullPath = `${currentPath}/${file.name}`;

        if (file.type === "file") {
          files.push(fullPath);
        }

        if (file.type === "directory" && file.files) {
          traverse(file.files, fullPath);
        }
      }
    };

    traverse(data.files, "");

    return files;
  }

  async loadFile(context: BuilderContext, path: string) {
    const { packageName, packagePath } = BuilderUtils.getPackageName(path);
    if (!packageName) {
      throw new Error(`Invalid path "${path}"`);
    }

    const current = this._packages[packageName];
    if (!current) {
      throw new Error(`Package "${packageName}" not found`);
    }

    const url = `${BuilderConstants.CDN_BASE_NPM}/${packageName}@${current.version}${packagePath}`;
    let data = context.cache.get(url);

    if (!data) {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch file "${packageName}@${current.version}${packagePath}"`);
      }

      const arrayBuffer = await response.arrayBuffer();
      data = new Uint8Array(arrayBuffer);
      context.cache.set(url, data);
    }

    return data;
  }

  private rewrite(packageName: string, packagePath: string) {
    const current = this._packages[packageName];

    if (!current) {
      throw new Error(`Package "${packageName}" not found`);
    }

    if (!packagePath) {
      const manifest = current.manifest;
      const main = manifest.module ?? manifest.main ?? manifest["umd:main"];
      packagePath += `/${main}`;
    } else {
      for (const subPackage of current.subPackages) {
        if (packagePath == subPackage.path) {
          const manifest = subPackage.manifest;
          if (!manifest) {
            throw new Error(`Manifest not found in package: ${packageName}/${subPackage.path}`);
          }

          const main = manifest.main ?? manifest["umd:main"] ?? manifest.module;

          if (!main) {
            throw new Error(`Main file not found in package: ${packageName}/${subPackage.path}`);
          }

          packagePath += `/${main}`;
        }
      }
    }

    return packagePath;
  }
}
