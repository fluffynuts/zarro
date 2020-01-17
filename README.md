# Zarro

## What is this?

Some glue to make gulp easier, perhaps even zero- or close-to-zero-conf
for some situations. In particular this should make building .NET (core
or framework) applications easier. This project is basically a port of
a git repo I've been using as a submodule in many places: I'm trying to
make it easier to consume:
- git submodules are difficult for some people to grok
  - which results in "wars" where the submodule version is rolled back and forth
- one less step at checkout: no more `git submodule update --init`
  - we have to `npm install` anyway

