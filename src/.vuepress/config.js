const { description } = require("../../package");

module.exports = {
  title: "Huff Language",
  description: description,
  homepage: "http://localhost:3000/",

  head: [
    ["meta", { name: "theme-color", content: "#c70202" }],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    [
      "meta",
      { name: "apple-mobile-web-app-status-bar-style", content: "black" },
    ],
  ],

  theme: "default-prefers-color-scheme",
  themeConfig: {
    overrideTheme: "dark",
    docsDir: "/",
    nav: [
      { text: "Home", link: "/home/" },
      { text: "Get Started", link: "/get-started/" },
      { text: "Tutorial", link: "/tutorial/overview/" },
    ],
    sidebarDepth: 10,
    sidebar: {
      "/get-started/": [
        {
          title: "Get Started",
          collapsable: false,
        },
      ],

      "/tutorial/": [
        {
          title: "Tutorial",
          collapsable: false,
          children: [
            "/tutorial/overview/",
            "/tutorial/setup/",
            "/tutorial/evm-basics/",
            "/tutorial/project-template/",
          ],
        },
      ],
    },
    smoothScroll: true,
  },
};
