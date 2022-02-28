import { IFileHandler } from "inkjs/compiler/IFileHandler";


export class FileHandlerError extends Error{}

export class JsonFileHandler implements IFileHandler {
    public _activeFile: string = "file:///default.ink";

    constructor(public readonly fileHierarchy: Record<string, string>) {}
  
    readonly ResolveInkFilename = (filename: string): string => {
      if (Object.keys(this.fileHierarchy).includes(`file:///${filename}`)) return filename;
      throw new FileHandlerError(
        `RUNTIME ERROR: '${filename}' line 0: Cannot locate file ${filename}.`
      );
    };
  
    readonly LoadInkFileContents = (filename: string): string => {
      if (Object.keys(this.fileHierarchy).includes(`file:///${filename}`)) {
        return this.fileHierarchy[`file:///${filename}`];
      } else {
        throw new FileHandlerError(
            `RUNTIME ERROR: '${filename}' line 0: Cannot open file ${filename}.`
        );
      }
    };

    readonly update = (filename: string, content: string): JsonFileHandler => {
        this.fileHierarchy[filename] = content;
        return this;
    }

    readonly delete = (filename: string): JsonFileHandler => {
        delete this.fileHierarchy[filename];
        return this;
    }

    readonly active = (filename?: string): JsonFileHandler | string => {
        if(filename === undefined) return this._activeFile;
        this._activeFile = filename;
        return this;
    }
  }
  