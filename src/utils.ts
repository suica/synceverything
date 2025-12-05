import * as os from "os";
import * as path from "path";
import { Uri, workspace, FileSystemError } from "vscode";

import { logger } from "./extension";

const getCustomUserDir = (): string | undefined => {
  const args = process.argv;
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith("--user-data-dir")) {
      continue;
    }

    const inlineValue = arg.split("=")[1];
    if (inlineValue) {
      return path.join(path.resolve(inlineValue), "User");
    }

    const nextValue = args[i + 1];
    if (nextValue && !nextValue.startsWith("--")) {
      return path.join(path.resolve(nextValue), "User");
    }
  }

  return undefined;
};

const getConfigPaths = (
  appName: string,
  file: string,
  preferredUserDir?: string
): string[] => {
  const platformPaths = (() => {
    switch (os.platform()) {
      case "win32":
        return [
          `${process.env.APPDATA}\\${appName}\\User\\${file}`,
          `${process.env.USERPROFILE}\\AppData\\Roaming\\${appName}\\User\\${file}`,
        ];
      case "darwin":
        return [
          `${process.env.HOME}/Library/Application Support/${appName}/User/${file}`,
          `${os.homedir()}/Library/Application Support/${appName}/User/${file}`,
        ];
      default:
        return [
          `${process.env.HOME}/.config/${appName}/User/${file}`,
          `${
            process.env.XDG_CONFIG_HOME || `${os.homedir()}/.config`
          }/${appName}/User/${file}`,
          `${os.homedir()}/.config/${appName}/User/${file}`,
        ];
    }
  })();

  const configuredUserDir = preferredUserDir ?? getCustomUserDir();
  if (configuredUserDir) {
    return [path.join(configuredUserDir, file), ...platformPaths];
  }

  return platformPaths;
};

export async function pathExists(path: string): Promise<boolean> {
  try {
    await workspace.fs.stat(Uri.file(path));
    logger.info(`Found file at: ${path}`);
    return true;
  } catch (error) {
    return false;
  }
}

export const findConfigFile = async (
  appName: string,
  file: string,
  preferredUserDir?: string
): Promise<string> => {
  const possiblePaths = getConfigPaths(appName, file, preferredUserDir);
  for (const candidatePath of possiblePaths) {
    if (await pathExists(candidatePath)) {
      return Uri.file(candidatePath).fsPath;
    } else {
      continue;
    }
  }
  logger.error(
    `Could not find ${file} in any default location`,
    "utils.findConfigFile",
    true
  );
  throw FileSystemError.FileNotFound(
    `${file} does not exist in any of the configuration directories`
  );
};
