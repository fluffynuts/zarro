import { OctokitRelease, OctokitReleaseAssets, RepoInfo } from './types';
export interface FetchReleaseOptions extends RepoInfo {
    getRelease: (owner: string, repo: string) => Promise<OctokitRelease>;
    getAsset?: (version: string, assets: OctokitReleaseAssets) => OctokitReleaseAssets[number] | undefined;
    accessToken?: string;
    destination?: string;
    shouldExtract?: boolean;
}
/**
 * Downloads and extract release for the specified tag from Github to the destination.
 *
 * await fetchLatestRelease({ owner: 'smallstep', repo: 'cli', tag: '1.0.0' })
 */
export declare function fetchReleaseByTag(options: Omit<FetchReleaseOptions, 'getRelease'> & {
    tag: string;
}): Promise<string[]>;
/**
 * Downloads and extract latest release from Github to the destination.
 *
 * await fetchLatestRelease({ owner: 'smallstep', repo: 'cli' })
 */
export declare function fetchLatestRelease(options: Omit<FetchReleaseOptions, 'getRelease'>): Promise<string[]>;
