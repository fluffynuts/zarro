"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetDefault = void 0;
function getPlatformIdentifier() {
    switch (process.platform) {
        case 'win32':
            return { platform: 'windows', arch: 'amd64' };
        case 'linux':
            if (process.arch === 'arm64') {
                return { platform: 'linux', arch: 'arm64' };
            }
            if (process.arch === 'arm') {
                return { platform: 'linux', arch: 'arm' };
            }
            return { platform: 'linux', arch: 'amd64' };
        case 'darwin':
            return { platform: 'darwin', arch: 'amd64' };
        default:
            throw new Error('Unsupported platform');
    }
}
function getAssetDefault(version, assets) {
    const { platform, arch } = getPlatformIdentifier();
    const platformAssets = assets.filter((asset) => asset.name.includes(platform));
    if (platformAssets.length === 1) {
        return platformAssets[0];
    }
    const archAsset = platformAssets.find((asset) => asset.name.includes(arch));
    if (!archAsset) {
        throw new Error(`Unable to find release for platform: ${platform} and arch: ${arch}`);
    }
    return archAsset;
}
exports.getAssetDefault = getAssetDefault;
