# Testing Huff with Foundry

While Huff can be compiled through the command line tool, you can also use Foundry to test your code. [Foundry](https://github.com/foundry-rs/foundry) is a blazing fast, portable, modular toolkit for Ethereum application development. Foundry enables you to easily compile your contracts and write robust unit tests to ensure that your code is safe. This is especially important for Huff contracts, where there aren't many automatic safety-checks on your code.

You can use the two together via the [foundry-huff](https://github.com/huff-language/foundry-huff) library.


## Utilizing Foundry-Huff

If you have an existing Foundry project, you can simply install the necessary dependencies by running:

```shell
forge install huff-language/foundry-huff
```

You also must add the following line to your `foundry.toml` file to ensure that the foundry-huff library has access to your environment in order to compile the contract:

```shell
ffi = true
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

For more information on how to use Foundry, check out the [Foundry Github Repository](https://github.com/foundry-rs/foundry/tree/master/forge) and [Foundry Book](https://book.getfoundry.sh/).


## Using the Project Template

If you're looking to create a new project from scratch, you can use the [project template](https://github.com/huff-language/huff-project-template).

We go over using the project template in [https://docs.huff.sh/get-started/project-quickstart/](https://docs.huff.sh/get-started/project-quickstart/).

