# Zarro

## What is this?

Standing on the shoulders of giants, zarro is a zero- or low-conf orchestration for
(primarily) dotnet/.NET build and test (eg at CI), but it's also so much more - since
it's easy to add your own tasks, you can use zarro for whatever you like, but if you're
looking for CI build / test / coverage* for dotnet/.NET, this might be what you're looking
for.

_(* coverage works well for NUnit / .NET Framework, but I haven't found a nice process
for dotnet core - yet)_

## Why not just use `msbuild`?

Zarro wraps msbuild, using `gulp` orchestration under the hood. It does, however,
take away the pain of:
- knowing _where_ msbuild lives (since it consumes [gulp-msbuild](https://www.npmjs.com/package/gulp-msbuild)
- being able to use a specific version of msbuild (again, thanks to `gulp-msbuild`)
- running tests via `dotnet test` or via the NUnit CLI runner, as appropriate
- running coverage reporting (.NET Framework) via OpenCover
- downloading local variants of tooling required for the above so that your CI server
  doesn't have to have them installed, or kept up to date
    - note: zarro will not download msbuild tooling, but should work fine with any
        installed version of:
        - VS Community / Professional / Enterprise
        - VS Build Tools
        - dotnet sdk (dotnet kindly adds itself to the path)
- packing nuget packages, either from .nuspecs (.NET Framework) or directly
  from the .csproj (dotnet core)

## Fine, but I can do all of that with a batch file?

Perhaps (though the msbuild discovery is a bit of a PITA, especially since Microsoft
likes to keep us on our toes, mixing up exactly _where_ that's installed to, eg in
vs2019. The real win comes from:
- out of the box, on a simple-ish repo, zarro should be able to build and test,
  as long as you use the naming convention of `{Assembly}.Tests` for test projects
  (though it will also find `Test.{Assembly}` and an ubiquitous `Tests` assembluy)
- it's easy to add more tasks to your pipeline for further processing
- use the `gulp` orchestration framework to extend or override available tasks

## _Which_ `gulp`? 3 or 4? They don't play well together!

Zarro has you covered here. The heart of Zarro was originally built for gulp 3.
Version 4 came out and broke _everything_. I didn't feel like rewriting perfectly
acceptable tasks, but I did want to keep up with the latest version of `gulp` and
the speed advantages that were promised. As such, Zarro can consume and adapt
gulp 3 tasks to run under gulp 4.

## Getting started

1. `npm init -y` (if you don't already have a `package.json`
2. `npm install --save-dev zarro`
3. start adding scripts! for example:
    ```json
   "scripts": {
       "build": "zarro build",
       "test": "zarro test-dotnet",
       "zarro": "zarro"
   }
    ```
(the `test-dotnet` task should invoke zarro's inbuilt `build` task (and some earlier
ones to download tooling, as required) so that when test-time comes, assemblies
are already built (required for .NET Framework / NUnit runner, and optimised for
`dotnet` by performing the build and testing without rebuild)).

## Zarro doesn't do what I want out of the box

Zarro is designed to be zero- to low- conf. You can guide many aspects of available
tasks with environment variables. Running `npm run zarro -- --show-env` will show you
all observed environment variables and where they are applicable. I suggest using
`cross-env` and applying these variables in one place, to keep things simpler. For
example, [NExpect](https://github.com/fluffynuts/NExpect) does the following:

```json
"scripts": {
    "zarro": "cross-env DOTNET_CORE=1 BUILD_EXCLUDE=src/PeanutButter/**/* PACK_INCLUDE=* PACK_EXCLUDE=*Tests*,CoreConsumer,src/PeanutButter/**/* TEST_EXCLUDE=src/PeanutButter/**/* zarro",
    "build": "run-s \"zarro build\"",
    "test": "run-s \"zarro test-dotnet\""
}
```

in the above:
- `DOTNET_CORE=1` instructs zarro to use `dotnet` instead of searching for `msbuild`
- `BUILD_EXCLUDE=...` instructs zarro to exclude everything under that folder, recursively
  (NExpect imports PeanutButter as a submodule to use some shared code without relying
   on another package dependency)
- similarly `TEST_EXCLUDE` excludes PeanutButter tests
- similarly, `PACK_INCLUDE` and `PACK_EXCLUDE` control nuget packing within NExpect

## Custom tasks

Zarro will also search two folders:
- local-tasks
- override-tasks
in the root of your repo, for extra tasks that you can access from your npm scripts.

These can be brand-new functionality you'd like to add to your repo's build system,
or you can override existing tasks, if they don't suit you. For example, if the `pack`
task doesn't do exactly what you want, copy `pack.js` from `node_modules/zarro/gulp-tasks`
into your `local-tasks` folder and modify it to suit you. If you find a generic solution
to the problem you have which others might find useful or fix a bug, I'd like to know
about it. PRs for fixes and extension tasks which others could use will be appreciated.

## Examples of custom tasks that I've written in the past
- a watcher to automatically recompile scss to .css
- orchestration of build / test of sub-projects that aren't .NET
- automatic version incrementing of packages before release
- committing, tagging and pushing new changes to GitHub
  - I've found that writing a meta task called `release` can make it much
    less painful to perform a release of my nuget packages, for example.
    This meta task would:
      - build
      - test
      - increment package versions
      - pack
      - push packages
      - commit the updates package definitions
      - tag the release
      - push the tag and changes to GitHub

## API

Zarro provides some convenience functionality from baked-in modules. To access a module,
the global `requireModule` function will resolve the correct location for you. Modules
live under the `gulp-tasks/modules` folder. Most modules will return a single function,
though there are some exceptions. Some modules may be of interest to custom tasks, eg:

- `env`
    - provides a utility object to resolve environment variables for you
        - `register` can register an environment variable as known with a default
           value and help. See `register-environment-variables.js` for examples.
           When you use this function, you can have a central configuration for
           a default value for an environment variable and your environment
           variable will be displayed in the `--show-env` output
        - `resolve` resolves environment variables for you. It can be invoked with
            one or more variable names, so can be used to fall back from one variable
            onto another. It will also resolve back values if registered.
        - `associate` associates one or more variables with one or more tasks,
           primarily to show which tasks are affected by which variables when
           running with `--show-env`
        - `resolveArray` can resolve an environment variable to an array for you,
            with an optional `delimiter` parameter, which defaults to comma
        - `resolveNumber` resolves a numeric value from the named environment
            value or throws if the value can't be resolved as a number, effectively
            stopping execution. If you're expecting a number (eg port or max thread
            count) you can simply `resolveNumber` and an invalid value would cause
            execution to stop with a reasonable message
        - `resolveFlag` resolves boolean values from environment variables
            - `true` for: "yes", "true" or "1"
            - `false` for: "no", "false" or "0"
            - throws for unknown values
- `resolve-masks`
    - single function to resolve an array of masks that could be used in a `gulp.src`
        where those masks can be inclusive or exclusive
- `find-local-nuget`
    - provides a single function to find a locally-downloaded `nuget.exe`, automatically
        downloading it if required. Use this if you need to use `nuget.exe` operations
        and don't want to set up your build host with a pathed `nuget.exe`
- git utilities
    - `git-tag`
    - `git-push`
    - `git-push-tags`
- string padding
    - `pad`
    - `pad-left`
    - `pad-right`

There are many more utilities in there, feel free to browse the source.

## History

If you've made it thus far, some light history might be of interest. Zarro's core
functionality comes from another repo of mine: [gulp-tasks](https://github.com/fluffynuts/gulp-tasks)
which was traditionally consumed as a git submodule. However, it seems that a lot
of people don't really "get" git submodules:
- people forget (or don't understand that they need to) `git submodule update --init` after
  a `git clone` or a `git pull`. Some modern git clients are doing this for the user,
  but not all of them.
- people don't seem to understand how submodules are stored (literally just a hash and
  an url), so they don't pay attention when committing them. In particular, I have seen
  my fair share of inadvertent "submodule wars" where changes upstream aren't applied
  after a `pull` (ie, people forget to run `git submodule update --init`), then they
  re-commit back the _old version_ of the module that they have locally. So fixes tend
  to become unfixed
- in addition, `gulp-tasks` requires dependencies to be installed in the hosting repo's
  package.json, meaning that (a) the hosting repo has to "know too much" about the
  requirements of `gulp-tasks` and (b) upstream changes may require changes to a repo's
  package.json (and an `npm install`). Whilst this was (eventually) automated as part
  of `gulp-tasks`, it seems unnecessarily complex.
- the solution seemed clear: make `gulp-tasks` available via an npm package
- the name is inspired from the old bugzilla, which would proudly proclaim "zarro boogs"
  when there were zero bug matches for a query, because (a) names are hard and (b)
  zarro aims to be zero- to low-conf
