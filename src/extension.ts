import * as vscode from "vscode";
import { generateJson, getKeyValue, getVariable } from "./methods";
import { MESSAGES, SETTINGS } from "./constants";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "Transform clipboard into CMS messages/settings" is now active!'
  );

  let disposable = vscode.commands.registerCommand(
    "extension.generateCmsMessagesSettings",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage(
          "Open a file first to manipulate the text selections"
        );

        return;
      }

      const options: vscode.QuickPickItem[] = [
        { label: MESSAGES, description: "Generate CMS Messages" },
        { label: SETTINGS, description: "Generate CMS Settings" },
      ];

      const selectedOption = await vscode.window.showQuickPick(options, {
        placeHolder: "Select an option",
        canPickMany: false,
      });

      if (!selectedOption) {
        return;
      }

      const selections = editor.selections;

      editor.edit(() => {
        for (const selection of selections) {
          const text = editor.document.getText(selection);
          const hasBannedChars = text.match(
            /[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\,\"\'\`\:\=\.\-\\]/
          );

          if (hasBannedChars) {
            return vscode.window.showErrorMessage(
              `Selected string contains banned char: ${hasBannedChars.at(0)}`
            );
          }

          const variables = getVariable(text);
          const keyValues = variables
            .map((variable) => {
              return getKeyValue(variable);
            })
            .filter(({ key }) => key.match(/^[a-zA-Z0-9]+$/));

          const json = generateJson(keyValues, selectedOption.label);

          if (!keyValues.length || keyValues.length !== variables.length) {
            return vscode.window.showWarningMessage(
              "Some content could not be parsed into CMS Messages/Settings. Make sure that the key does not contain whitespaces."
            );
          }
          const copiedKeys = keyValues.map(({ key }) => key);

          vscode.window.showInformationMessage(
            `[${copiedKeys.join(
              ",\n"
            )}] and its values has been copied into the clipboard.`
          );
          vscode.env.clipboard.writeText(json);
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
