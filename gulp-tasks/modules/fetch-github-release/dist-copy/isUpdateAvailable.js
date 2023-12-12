"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newerVersion = exports.listReleases = exports.fetchLatestReleaseInfo = exports.isUpdateAvailable = void 0;
const rest_1 = require("@octokit/rest");
const semver_1 = require("semver");
function isUpdateAvailable(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { repo, owner, currentVersion, accessToken } = options;
        const { data: { tag_name: latestVersion }, } = yield new rest_1.Octokit({ auth: accessToken }).repos.getLatestRelease({ owner, repo });
        return newerVersion(latestVersion, currentVersion);
    });
}
exports.isUpdateAvailable = isUpdateAvailable;
function fetchLatestReleaseInfo(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const { repo, owner, accessToken } = opts;
        const result = yield new rest_1.Octokit({ auth: accessToken }).repos.getLatestRelease({ owner, repo });
        return result.data;
    });
}
exports.fetchLatestReleaseInfo = fetchLatestReleaseInfo;
function listReleases(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const { repo, owner, accessToken } = opts;
        const result = yield new rest_1.Octokit({ auth: accessToken }).repos.listReleases({ owner, repo });
        return result.data;
    });
}
exports.listReleases = listReleases;
function newerVersion(latestVersion, currentVersion) {
    if (!latestVersion) {
        return false;
    }
    if (!currentVersion) {
        return true;
    }
    const normalizedLatestVersion = latestVersion.replace(/^v/, "");
    const normalizedCurrentVersion = currentVersion.replace(/^v/, "");
    return (0, semver_1.gt)(normalizedLatestVersion, normalizedCurrentVersion);
}
exports.newerVersion = newerVersion;
