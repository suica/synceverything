import { defineConfig } from "@vscode/test-cli";
import fs from "fs";
import path from "path";

const userDataDir = path.resolve(".vscode-test/user-data-e2e");
const userDir = path.join(userDataDir, "User");

// Ensure the fixture files exist *before* VS Code launches, so that
// onStartupFinished activation can discover them immediately.
fs.mkdirSync(userDir, { recursive: true });
fs.writeFileSync(path.join(userDir, "settings.json"), "{}", "utf8");
fs.writeFileSync(path.join(userDir, "keybindings.json"), "[]", "utf8");

export default defineConfig({
  extensionDevelopmentPath: path.resolve("."),
  workspaceFolder: path.resolve("."),
  files: "out/test/userDataDirDiscovery.test.js",
  launchArgs: [`--user-data-dir=${userDataDir}`],
});
