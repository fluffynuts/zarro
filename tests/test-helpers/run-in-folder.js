"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInFolder = runInFolder;
async function runInFolder(folder, fn) {
    const start = process.cwd(), alreadyThere = start === folder;
    if (!alreadyThere) {
        process.chdir(folder);
    }
    try {
        return await fn();
    }
    finally {
        if (!alreadyThere) {
            process.chdir(start);
        }
    }
}
