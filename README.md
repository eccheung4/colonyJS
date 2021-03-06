<img align="center" src="/docs/img/colonyJS_color.svg" />

# colonyJS

[![Greenkeeper badge](https://badges.greenkeeper.io/JoinColony/colonyJS.svg?token=1fee7a42ece06b33380b3cc2c710775c7ae6e442a086a59dd77cd7e2809fe47c&ts=1518711661590)](https://greenkeeper.io/)

colonyJS is a JavaScript client for the [Colony Network](https://github.com/JoinColony/colonyNetwork). It provides a high-level API for interacting with the Colony Network smart contracts.

To learn more about Colony, you can visit [the website](https://colony.io/) or read the [white paper](https://colony.io/whitepaper.pdf).

## Documentation

Please see the [full documentation](https://joincolony.github.io/colonyjs/docs-overview/) with detailed examples and explanations.

## Contributing

We welcome all contributions to colonyJS. Please read our [contributing guidelines](https://github.com/JoinColony/colonyJS/blob/master/CONTRIBUTING.md).

## Development

colonyJS is a monorepo-based project. A monorepo is simply a common repository for all npm modules of a certain scope, sharing common modules and dev environments. You can learn more about monorepos [here](https://github.com/babel/babel/blob/master/doc/design/monorepo.md).

We're using [yarn workspaces](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/) and [lerna](https://github.com/lerna/lerna) to manage this monorepo.

[Flow](https://flow.org/) typing is also use throughout this repo.

### Yarn workspaces

To use yarn workspaces you'll have to activate it in your yarn settings like so:

```bash
yarn config set workspaces-experimental true
```

Then a `yarn` in the root directory will install all necessary packages (also in `packages/*`) and link the interdependencies.

To add a dependency to a particular package, just run

```bash
yarn add [packagename]
```

in your `packages/*` directory.

### Lerna

We're using lerna to publish the packages to npm and to run commands inside the repositories. We're running in lerna's `independence` mode, meaning the modules won't all have the same version number and are versioned independently.

To run a command (e.g. the `build` command) in all packages just do:

```
lerna run build
```

which will call the npm script for `build` (more info [here](https://github.com/lerna/lerna#run)).

To publish modules to npm, run:

```
lerna publish
```

and it will guide you through the [publish process](https://github.com/lerna/lerna#publish).

To run a command for a single package, lerna ought to be used in order
for the environment to resolve the common devDependencies:

```
lerna run --scope=@colony/my-package-name test
```
