# Huff Project Template

Huff has a [project template](https://github.com/huff-language/huff-project-template) to make it easier to get started writing Huff contracts!


## Using the Template

After navigating to https://github.com/huff-language/huff-project-template, you can click the [Use this template](https://github.com/huff-language/huff-project-template/generate) button on the top right of the repository to create a new repository containing all of the template's code.

Once you've cloned and entered into your repository, you need to install the necessary dependencies. In order to do so, simply run:

```bash
forge install
```

Then, you can build and/or run tests with the following commands:

```bash
forge build
forge install
```

Inside the template, there is a contract in the `src/` directory (the default location for huff contracts) called `src/SimpleStore.huff`.  This contract demonstrates a simple contract to set and get values stored in the contract, with the functions being (as defined by the function annotations at the top of the contract):

```solidity
function setValue(uint256);
function getValue() view returns (uint256);
```

Inside the `test/` directory, there are tests for the `src/SimpleStore.huff` contract in `test/SimpleStore.t.sol`. Since [Foundry](https://github.com/foundry-rs/foundry) doesn't natively support compiling huff code, huff projects have to use the [foundry-huff](https://github.com/huff-language/foundry-huff) library to be able to compile huff code using `forge` commands.

_NOTE: In order to compile huff code, foundry-huff behind the scenes need the [huff compiler](https://github.com/huff-language/huff-rs) to be installed._

Returning back to our test contract `test/SimpleStore.t.sol`, we can run the following command to run all tests: `forge test`.


## Other Template Features

Once you have created a new repository from the [project template](https://github.com/huff-language/huff-project-template), there are a few things to note before digging in and writing your huff contracts.

The [foundry.toml](https://github.com/huff-language/huff-project-template/blob/main/foundry.toml) file located in the root of the project template, contains the configuration for using the `forge` toolchain.

Inside [./.github/workflows](https://github.com/huff-language/huff-project-template/tree/main/.github/workflows) there is a github action file that will run CI using the [Foundry toolchain](https://github.com/foundry-rs/foundry-toolchain) and the [huff-toolchain](https://github.com/huff-language/huff-toolchain).















# Testing Huff with Foundry

While Huff can be compiled through the command line tool, you can also use Foundry to test your code. [Foundry](https://github.com/foundry-rs/foundry) is a blazing fast, portable, modular toolkit for Ethereum application development. Foundry enables you to easily compile your contracts and write robust unit tests to ensure that your code is safe. This is especially important for Huff contracts, where there aren't many automatic safety-checks on your code.

You can use the two together via the [foundry-huff](https://github.com/huff-language/foundry-huff) library.

## Utilizing Foundry-Huff

If you have an existing Foundry project, you can simply install the necessary dependencies by running (TODO: update for huff-rs):

```shell
yarn global add huffc@latest ts-node
forge install huff-language/foundry-huff
```

You also must add the following line to your `foundry.toml` file to ensure that the foundry-huff library has access to your environment in order to compile the contract:

```shell
ffi = true;
```

You can then use `HuffDeployer` contract to compile and deploy your Huff contracts for you using the `deploy` function. Here's a quick example:

```javascript
import { HuffDeployer } from "foundry-huff/HuffDeployer.sol";

contract HuffDeploymentExample {
    function deploy() external returns(address) {
        return new HuffDeployer().deploy("MyContract");
    }
}
```

## Using the Project Template

If you're looking to create a new project from scratch, you can use the [project template](https://github.com/huff-language/huff-project-template).

First, go to the template repository (found [here](<(https://github.com/huff-language/huff-project-template)), click "Use this template" on create a new repository with this repo as the initial state.

Once you've cloned and entered into your repository, we've made it easy install the necessary dependencies using a makefile. Just run:

```shell
make
```

To build and test your contracts, run:

```shell
forge build
forge test
```

For more information on how to use Foundry, check out the [Foundry Github Repository](https://github.com/foundry-rs/foundry/tree/master/forge) and [Foundry Book](https://book.getfoundry.sh/).
