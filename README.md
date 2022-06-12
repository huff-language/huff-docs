<img align="right" width="150" height="150" top="100" src="./src/.vuepress/public/huff.png">

# huff-docs • [![Netlify Status](https://api.netlify.com/api/v1/badges/ca51353d-d673-49b9-b07c-2547fdc9de9b/deploy-status)](https://app.netlify.com/sites/huffdocs/deploys) ![License](https://img.shields.io/github/license/huff-language/huff-docs) ![Version](https://img.shields.io/github/package-json/v/huff-language/huff-docs)

> [Huff](https://github.com/huff-language) Language Documentation built with [Vuepress](https://vuepress.vuejs.org/) and deployed at [docs.huff.sh](https://docs.huff.sh).

## Usage

Build the vuepress site by running `yarn build`.

To run the site locally, execute `yarn dev`.

In [src/README.md](./src/README.md), the home page of the site is defined. Each subdirectory in [src](./src/) represents a page of the site.

**New Pages**

To add a new page, the page contents must be written in an [src](./src/) subdirectory. This will host the page at `https://docs.huff.sh/<page-name>` but will not create an item in the navbar. In order to add the new page to the navbar, an entry must be added to the Vuepress config file located in [src/.vuepress/config.js](./src/.vuepress/config.js).

Page and comprehensive site styles can be defined in [src/.vuepress/styles/](./src/.vuepress/styles/).





