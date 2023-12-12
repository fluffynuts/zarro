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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLatestRelease = exports.fetchReleaseByTag = void 0;
const yafs_1 = require("yafs");
const path_1 = __importDefault(require("path"));
const rest_1 = require("@octokit/rest");
const decompress_1 = __importDefault(require("decompress"));
const bent = require("bent");
const constants_1 = require("./constants");
const util_1 = require("./util");
const getAssetDefault_1 = require("./getAssetDefault");
function determineFilenameFrom(response) {
    const contentDisposition = response.headers["content-disposition"];
    if (!contentDisposition) {
        // guess? shouldn't get here from GH queries...
        return fallback();
    }
    const parts = contentDisposition.split(";").map(s => s.trim());
    for (const part of parts) {
        let match = part.match(/^filename=(?<filename>.+)/i);
        if (match && match.groups) {
            const filename = match.groups["filename"];
            if (filename) {
                return filename;
            }
        }
    }
    return fallback();
    function fallback() {
        console.warn(`Unable to determine filename from request, falling back on release.zip`);
        return "release.zip";
    }
}
function download(url, destination) {
    return __awaiter(this, void 0, void 0, function* () {
        const fetch = bent(url);
        try {
            const response = yield fetch();
            const data = yield response.arrayBuffer();
            const filename = determineFilenameFrom(response);
            yield (0, yafs_1.writeFile)(path_1.default.join(destination, filename), data);
            return determineFilenameFrom(response);
        }
        catch (e) {
            const err = e;
            if (err.statusCode === undefined) {
                throw err;
            }
            if (err.statusCode === 301 || err.statusCode === 302) {
                const next = err.headers["location"];
                if (!next) {
                    throw new Error(`No location provided for http response ${err.statusCode}`);
                }
                return download(next, destination);
            }
            throw err;
        }
    });
}
function fetchRelease(options) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { owner, repo, getRelease, getAsset = getAssetDefault_1.getAssetDefault, destination = constants_1.PACKAGE_DATA_DIR, shouldExtract = true, } = options;
        if (!owner) {
            throw new Error('Required "owner" option is missing');
        }
        if (!repo) {
            throw new Error('Required "repo" option is missing');
        }
        const { data: { assets, tag_name: version }, } = yield getRelease(owner, repo);
        const downloadUrl = (_a = getAsset(version, assets)) === null || _a === void 0 ? void 0 : _a.browser_download_url;
        if (!downloadUrl) {
            throw new Error('Unable to find download URL');
        }
        yield (0, util_1.ensureDirExist)(destination);
        const filename = yield download(downloadUrl, destination);
        const downloadPath = path_1.default.join(destination, filename);
        if (shouldExtract) {
            const files = yield (0, decompress_1.default)(downloadPath, destination);
            yield (0, yafs_1.rm)(downloadPath);
            return files.map((file) => path_1.default.join(destination, file.path));
        }
        return [downloadPath];
    });
}
/**
 * Downloads and extract release for the specified tag from Github to the destination.
 *
 * await fetchLatestRelease({ owner: 'smallstep', repo: 'cli', tag: '1.0.0' })
 */
function fetchReleaseByTag(options) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetchRelease(Object.assign(Object.assign({}, options), { getRelease: (owner, repo) => new rest_1.Octokit({ auth: options.accessToken }).repos.getReleaseByTag({
                owner,
                repo,
                tag: options.tag,
            }) }));
    });
}
exports.fetchReleaseByTag = fetchReleaseByTag;
/**
 * Downloads and extract latest release from Github to the destination.
 *
 * await fetchLatestRelease({ owner: 'smallstep', repo: 'cli' })
 */
function fetchLatestRelease(options) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetchRelease(Object.assign(Object.assign({}, options), { getRelease: (owner, repo) => new rest_1.Octokit({ auth: options.accessToken }).repos.getLatestRelease({ owner, repo }) }));
    });
}
exports.fetchLatestRelease = fetchLatestRelease;
