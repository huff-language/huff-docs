# Huff CLI

While most of the time you will be compiling your Huff contracts in a foundry
project using the [foundry-huff](https://github.com/huff-language/foundry-huff)
library, the [compiler](https://github.com/huff-language/huff-rs)'s CLI offers some additional configuration options as well as some useful utilities.

## Options

```plaintext
USAGE:
    huffc [OPTIONS] [--] [PATH]

ARGS:
    <PATH>    The contract(s) to compile

OPTIONS:
    -a, --artifacts                       Whether to generate artifacts or not
    -b, --bytecode                        Generate and log bytecode
    -d, --output-directory <OUTPUTDIR>    The output directory [default: ./artifacts]
    -g, --interface                       Generate solidity interface for a Huff artifact
    -h, --help                            Print help information
    -i, --inputs <INPUTS>...              The input constructor arguments
    -n, --interactive                     Interactively input the constructor args
    -o, --output <OUTPUT>                 The output file path
    -p, --print                           Prints out to the terminal
    -s, --source-path <SOURCE>            The contracts source path [default: ./contracts]
    -v, --verbose                         Verbose output
    -V, --version                         Print version information
    -z, --optimize                        Optimize compilation [WIP]
```

### `-a` Artifacts

Passing the `-a` flag will generate `Artifact` JSON file(s) in the `./artifacts`
directory or wherever the `-d` flag designates. The `Artifact` JSON contains
the following information:
* File
  * Path
  * Source
  * Dependencies
* Bytecode
* Runtime Bytecode
* Contract ABI

Example:
```shell
huffc ./src/ERC20.huff -a
```

### `-b` Bytecode

Passing the `-b` flag will tell the compiler to log the bytecode generated during
the compilation process to the console.

Example:
```shell
huffc ./src/ERC20.huff -b
```

### `-d` Output directory

Arguments: `<OUTPUT_DIR>`, Default: `./artifacts`

Passing the `-d` flag allows you to designate the directory that the `Artifact`
JSON file will be exported to.

Example:
```shell
huffc ./src/ERC20.huff -d ./my_artifacts
```

### `-g` Interface

Passing the `-g` flag will generate a Solidity interface for the Huff contract
provided. This interface is generated based off of the function and event
definitions within the contract.

The solidity file will always be named `I<HUFF_FILE_NAME>.sol`, and it will be
saved in the same directory as the Huff contract itself.

Example:
```shell
huffc ./src/ERC20.huff -g
```

### `-i` Inputs

Arguments: `[CONSTRUCTOR_ARGS]`

Passing the `-i` flag allows you to set the constructor arguments for the
contract that is being compiled. All inputs should be separated by a comma.
If you'd like to input the constructor arguments interactively instead,
use the `-n` flag.

Example (assuming `ERC20.huff`'s constructor accepts a String and a uint):
```shell
huffc ./src/ERC20.huff -i "TestToken", 18
```

### `-n` Interactive Inputs

Passing the `-n` flag allows you to input constructor arguments
interactively through the CLI rather than via the `-i` flag.

Example:
```shell
huffc ./src/ERC20.huff -n
```

### `-o` Output

Arguments: `<FILE_PATH>`

Passing the `-o` flag allows you to export the artifact to a specific file
rather than a folder.

Example:
```shell
huffc ./src/ERC20.huff -o ./artifact.json
```

### `-s` Source Path

Arguments: `<CONTRACTS_FOLDER>`, Default: `./contracts`

Passing the `-s` flag allows you to change the directory that the compiler scans
for Huff contracts.

Example:
```shell
huffc -s ./src/
```

### `-v` Verbose Output

Passing the `-v` flag will tell the compiler to print verbose output during
the compilation process. This output can be useful for debugging contract
as well as compiler errors.

Example:
```shell
huffc ./src/ERC20.huff -v
```

### `-z` Optimize

Not yet implemented in [the compiler](https://github.com/huff-language/huff-rs).
