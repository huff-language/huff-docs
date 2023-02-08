## Installing Huff

The [Huff Compiler](https://github.com/huff-language/huff-rs) is built in Rust to create an extremely performant experience compiling huff.

Installation of the compiler is similar to that of [Foundry](https://github.com/foundry-rs/foundry).

First, install `huffup`, a version control manager for the Huff Compiler:

```shell
curl -L get.huff.sh | bash
```

_NOTE: This installs the `huffup` binary, but does not guarantee it is added to your path. If you get an error like `huffup: command not found`, you will need to source your path by running `source ~/.bashrc` or `source ~/.zshrc`. Alternatively, you can open a new terminal window._

Now, with `huffup` installed and in your path, you can simply run `huffup` to install the latest stable version of `huffc` (the huff compiler).

🎉 TADA, Huff is installed! 🎉

To verify for yourself that it's installed, run `huffc --help` to view the help menu.

If you get an error, or it is not installing correctly, send a message in the `#help` channel of the Huff Language [Discord Server](https://discord.gg/C3gTvkFNRR).


To get started compiling Huff Contracts, check out [compiling](https://docs.huff.sh/get-started/compiling/).

To diver deeper into the compiler's cli abilities, check out the [cli docs](https://docs.huff.sh/resources/cli/).
