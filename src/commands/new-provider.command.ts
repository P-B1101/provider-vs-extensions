import * as _ from "lodash";
import * as changeCase from "change-case";
import * as mkdirp from "mkdirp";

import {
    InputBoxOptions,
    OpenDialogOptions,
    Uri,
    window,
} from "vscode";
import { existsSync, lstatSync, writeFile } from "fs";
import { getProviderStateTemplate, getProviderTemplate } from "../templates";
export const newProvider = async (uri: Uri) => {
    const providerName = await promptForProviderName();
    if (_.isNil(providerName) || providerName.trim() === "") {
        window.showErrorMessage("The provider name must not be empty");
        return;
    }

    let targetDirectory;
    if (_.isNil(_.get(uri, "fsPath")) || !lstatSync(uri.fsPath).isDirectory()) {
        targetDirectory = await promptForTargetDirectory();
        if (_.isNil(targetDirectory)) {
            window.showErrorMessage("Please select a valid directory");
            return;
        }
    } else {
        targetDirectory = uri.fsPath;
    }

    const pascalCaseProviderName = changeCase.pascalCase(providerName);
    try {
        await generateProviderCode(providerName, targetDirectory);
        window.showInformationMessage(
            `Successfully Generated ${pascalCaseProviderName} Provider`
        );
    } catch (error) {
        window.showErrorMessage(
            `Error:
        ${error instanceof Error ? error.message : JSON.stringify(error)}`
        );
    }
};

function promptForProviderName(): Thenable<string | undefined> {
    const providerNamePromptOptions: InputBoxOptions = {
        prompt: "Provider Name",
        placeHolder: "counter",
    };
    return window.showInputBox(providerNamePromptOptions);
}

async function promptForTargetDirectory(): Promise<string | undefined> {
    const options: OpenDialogOptions = {
        canSelectMany: false,
        openLabel: "Select a folder to create the provider in",
        canSelectFolders: true,
    };

    return window.showOpenDialog(options).then((uri) => {
        if (_.isNil(uri) || _.isEmpty(uri)) {
            return undefined;
        }
        return uri[0].fsPath;
    });
}

async function generateProviderCode(
    providerName: string,
    targetDirectory: string,
) {
    const providerDirectoryPath = targetDirectory;
    if (!existsSync(providerDirectoryPath)) {
        await mkdirp(providerDirectoryPath);
    }

    await Promise.all([
        createProviderStateTemplate(providerName, providerDirectoryPath),
        createProviderTemplate(providerName, providerDirectoryPath),
    ]);
}

function createProviderStateTemplate(
    providerName: string,
    targetDirectory: string,
) {
    const snakeCaseProviderName = changeCase.snakeCase(providerName);
    const targetPath = `${targetDirectory}/${snakeCaseProviderName}_state.dart`;
    if (existsSync(targetPath)) {
        throw Error(`${snakeCaseProviderName}_state.dart already exists`);
    }
    return new Promise<void>(async (resolve, reject) => {
        writeFile(
            targetPath,
            getProviderStateTemplate(providerName),
            "utf8",
            (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            }
        );
    });
}

function createProviderTemplate(
    providerName: string,
    targetDirectory: string,
) {
    const snakeCaseProviderName = changeCase.snakeCase(providerName);
    const targetPath = `${targetDirectory}/${snakeCaseProviderName}_provider.dart`;
    if (existsSync(targetPath)) {
        throw Error(`${snakeCaseProviderName}_provider.dart already exists`);
    }
    return new Promise<void>(async (resolve, reject) => {
        writeFile(
            targetPath,
            getProviderTemplate(providerName),
            "utf8",
            (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            }
        );
    });
}