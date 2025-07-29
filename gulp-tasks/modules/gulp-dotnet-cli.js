"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotnetCli = __importStar(require("dotnet-cli"));
(function () {
    const { streamify } = requireModule("streamify");
    const ZarroError = requireModule("zarro-error");
    const { log, colors } = requireModule("gulp-util");
    const { yellowBright, cyanBright } = colors;
    const env = requireModule("env");
    function wrap(fn) {
        return async (opts) => {
            if (opts.suppressOutput === undefined) {
                opts.suppressOutput = false;
            }
            const result = await fn(opts);
            if (result instanceof Error) {
                throw result;
            }
            // otherwise, discard the result
        };
    }
    function build(opts) {
        return streamify(wrap(dotnetCli.build), f => {
            const copy = Object.assign({}, opts);
            copy.target = f.path;
            return copy;
        }, "gulp-dotnet-cli-build", "building project or solution");
    }
    function clean(opts) {
        return streamify(wrap(dotnetCli.clean), f => {
            const copy = Object.assign({}, opts);
            copy.target = f.path;
            return copy;
        }, "gulp-dotnet-cli-clean", "cleaning project or solution");
    }
    function test(opts) {
        return streamify(wrap(dotnetCli.test), f => {
            const copy = Object.assign({}, opts);
            copy.target = f.path;
            return copy;
        }, "gulp-dotnet-cli-pack", "creating nuget package");
    }
    function pack(opts) {
        return streamify(wrap(dotnetCli.pack), async (f) => {
            const copy = Object.assign({}, opts);
            copy.target = f.path;
            return copy;
        }, "gulp-dotnet-cli-pack", "creating nuget package");
    }
    function nugetPush(opts) {
        return streamify(wrap(dotnetCli.nugetPush), f => {
            const copy = Object.assign({}, opts);
            copy.target = f.path;
            return copy;
        }, "gulp-dotnet-cli-nuget-push", "pushing nuget package");
    }
    function publish(opts) {
        return streamify(wrap(dotnetCli.publish), async (f) => {
            const copy = Object.assign({}, opts);
            copy.target = f.path;
            if (copy.publishContainer) {
                const containerOpts = await dotnetCli.resolveContainerOptions(copy), nameOpt = definitelyFind(containerOpts, "containerImageName"), tagOpt = definitelyFind(containerOpts, "containerImageTag"), registryOpt = definitelyFind(containerOpts, "containerRegistry");
                logResolvedOption("Publish container", nameOpt);
                logResolvedOption("         with tag", tagOpt);
                logResolvedOption("      to registry", registryOpt);
            }
            return copy;
        }, "gulp-dotnet-cli-publish", "publishing dotnet project");
    }
    const envVarLookup = {
        "containerImageName": env.DOTNET_PUBLISH_CONTAINER_IMAGE_NAME,
        "containerImageTag": env.DOTNET_PUBLISH_CONTAINER_IMAGE_TAG,
        "containerRegistry": env.DOTNET_PUBLISH_CONTAINER_REGISTRY
    };
    function logResolvedOption(label, opt) {
        log(`${yellowBright(label)}: ${cyanBright(opt.value)} (override with: ${opt.environmentVariable})`);
    }
    function definitelyFind(collection, key) {
        const found = collection.find(o => o.option === key);
        if (found) {
            const result = found;
            result.environmentVariable = envVarLookup[key];
        }
        throw new ZarroError(`Unable to find item with key: (${key})`);
    }
    module.exports = {
        build,
        clean,
        test,
        pack,
        nugetPush,
        publish
    };
})();
