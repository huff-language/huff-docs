# Getting started

Huff is a low-level programming language designed for developing highly optimized smart contracts that run on the Ethereum Virtual Machine (EVM). Huff does not hide the inner workings of the EVM and instead exposes its programming stack to the developer for manual manipulation.

The [Aztec Protocol](https://aztec.network/) team created Huff to write [Weierstrudel](https://github.com/aztecprotocol/weierstrudel/tree/master/huff_modules), an on-chain elliptical curve arithmetic library that requires incredibly optimized code that neither [Solidity](https://docs.soliditylang.org/) nor [Yul](https://docs.soliditylang.org/en/latest/yul.html) could provide.

While EVM experts can use Huff to write highly-efficient smart contracts for use in production, it can also serve as a way for beginners to learn more about the EVM.

If you're looking for an in-depth guide on how to write and understand Huff, check out the [tutorial](/tutorial/overview/).

## Command-line quickstart

If you plan on using Huff from the command-line, use the `huffc` package. `huffc` can be installed using [curl](https://curl.se/). Simply run:

```shell
curl -L https://get.huff.sh | bash
```

Once installed, to see all of the supported features, execute:

```shell
huffc --help
```

### Command-line Usage

Here is a quick and easy tutorial that goes through the process of compiling a simple Huff contract.

1. Create a file called `addition.huff` and enter the following:

   ```javascript
   #define function add(uint256,uint256) nonpayable returns (uint256)

   #define macro MAIN() = takes(0) returns (1) {
      // Load our numbers from calldata and add them together.
      0x04 calldataload // [number1]
      0x24 calldataload // [number2]
      add               // [number1+number2]

      // Return our new number.
      0x00 mstore // Store our number in memory.
      0x20 0x00 return // Return it.
   }
   ```

2. Use `huffc` to compile the contract and output bytecode:

   ```shell
   huffc addition.huff --bytecode
   ```

   This will output something similar to:

   ```plaintext
   61000f8061000d6000396000f36004356024350160005260206000f3
   ```

You can find an in-depth explanation of this contract in the tutorial (TODO: LINK THE TUTORIAL).
