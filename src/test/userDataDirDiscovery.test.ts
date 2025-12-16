import * as assert from "assert";
import * as path from "path";

import { describe, it } from "mocha";
import * as vscode from "vscode";

const EXTENSION_ID = "DunderDev.sync-everything";
const TEST_COMMAND = "synceverything.__test.getResolvedConfigPaths";

describe("Config discovery honors user-data-dir", () => {
  it("prefers <user-data-dir>/User when resolving settings/keybindings", async function () {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    assert.ok(workspaceFolder, "workspaceFolder should be set for tests");
    const userDataDir = path.resolve(
      workspaceFolder,
      ".vscode-test",
      "user-data-e2e"
    );
    const expectedUserDir = path.join(userDataDir, "User");
    const expectedSettingsPath = path.join(expectedUserDir, "settings.json");
    const expectedKeybindingsPath = path.join(expectedUserDir, "keybindings.json");

    const ext = vscode.extensions.getExtension(EXTENSION_ID);
    assert.ok(ext, `Extension ${EXTENSION_ID} should be present`);
    await ext.activate();

    const result = (await vscode.commands.executeCommand(TEST_COMMAND)) as
      | ({ settingsPath?: string; keybindingsPath?: string } | undefined);
    assert.ok(result, "Test command should return a result object");

    assert.strictEqual(
      path.normalize(result.settingsPath ?? ""),
      path.normalize(expectedSettingsPath)
    );
    assert.strictEqual(
      path.normalize(result.keybindingsPath ?? ""),
      path.normalize(expectedKeybindingsPath)
    );
  });
});

