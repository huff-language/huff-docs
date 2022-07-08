# Contributing

## Overview
Welcome, and thanks for having an interest in contributing to the Huff Language and related repositories!

All contributions are welcome! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer


Contributing to Huff Language is not just limited to writing code. It can mean a wide array of things, such as participating in discussions in our [discord server](https://discord.gg/h8pkspwx) or reporting issues.

## Issues
We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/huff-language/huff-rs/issues/new); it's that easy!

To run examples, make sure you update git submodules to pull down the [huff-examples](./huff-examples/) submodule by running `git submodule update`.

## Pull Requests

The branching convention used by [huff-rs](https://github.com/huff-language/huff-rs) is a `stage` branch that is meant to be merged off of and is periodically merged into `main`. So, when creating a feature, branch off of the `stage` branch and create a pr from your branch into the `stage` branch!

i.e:
![Branching Conventions](https://github.com/huff-language/huff-rs/raw/main/assets/branching.png)

To pass github actions, please run:

```shell
cargo check --all
cargo test --all --all-features
cargo +nightly fmt -- --check
cargo +nightly clippy --all --all-features -- -D warnings
```

In order to fix any formatting issues, run:

```shell
cargo +nightly fmt --all
```

### Recommended PR Template

Here is an example PR template - not strictly required, but will greatly improve the speed at which your PR is reviewed & merged!

```md
## Overview

<Provide a general overview of what your pr accomplishes, why, and how (including links)>

## Checklist

- [x] <Ex: Added a `new` method to the Huff Lexer [here](./huff_lexer/src/lib.rs#50)>
- [x] <Ex: Fully tested the `new` method [here](./huff_lexer/tests/new.rs)>
- [ ] <Ex: Wrote documentation for the `new` method [here](./huff_lexer/README.md#20)>
```

When the PR checklist isn't complete, it is **highly** recommended to make it a draft PR. NOTE: if your PR is not complete, it will likely be changed to a draft by one of the repository admins.

For breaking changes: make sure to edit the [excalidraw asset](https://excalidraw.com/#json=9YvTZp-rY9NOQnX9TC8Dz,sVM8vpgvQqGiXNXrBNshTg) and export the file to [./assets/huffc.excalidraw](./assets/huffc.excalidraw) along with an image to [./assets/huffc.png](./assets/huffc.png).
