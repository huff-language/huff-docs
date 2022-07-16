## Hello, world?: Huff

### Getting Started

Before you get started writing huff you will have to install the compiler. Head over to getting started and follow the steps to get it installed.
Once that is done - come back here!! 

### What you are going to learn?
Unlike other programming languages, creating a huff contract that returns "hello world" is quite advanced! To keep things simple we are first going to learn how to create a huff contract that adds two numbers (then we will dive into "Hello, world"!).
Open up your editor and create a file called `addTwo.huff`. Lets jump in. 

### The Anatomy of a Huff Contract
#### ABI declaration
First things first. If you're coming from a higher level language like solidity or vyper you will be familiar with defining "external" or "public" functions to allow you to interact with your contract with external tools by generating an ABI (Application Binary Interface). This tells external tools or software languages how to target specific functions within a contract (We will dive more into this later). Huff is exactly the same, you can declare functions that will be appear in the abi at the top of the file. 

```huff
#define function addTwo(uint256, uint256) view returns(uint256)
```

Go ahead and paste the above example at the top of `addTwo.huff`. This means that we are declaring a function that takes two `uint256` inputs and returns a single `uint256`.

#### The Main Macro
The next thing we are going to create is the `main macro`. This serves as the entry point for our contract. All calls to your deployed contract (regardless of what function they are calling) will start from here! In this example we will define a MAIN function that will read two `uint256`'s from calldata and return their result.

```huff
#define macro MAIN() = takes(0) returns(0) {
    0x00 calldataload     // [number1] // load first 32 bytes onto the stack - number 1     
    0x20 calldataload     // [number2] // load second 32 bytes onto the stack - number 2
    add                   // [number1+number2] // add number 1 and 2 and put the result onto the stack
    
    0x00 mstore           // place [number1 + number2] in memory
    0x20 0x00 return      // return the result
}
```

Looking at the above snippet may be intimidating at first, but bear with us.

You'll notice that the MAIN directive is annotated with `takes(0) returns(0)`. As the EVM is a stack based virtual machine [TODO](see more), all macro declarations are annotated with the amount of stack items they will consume (take) and what they will add to the stack afterwards (returns). As this is the entry point to the program, and the stack is empty and we will not be leaving anything on the stack after execution, therefore takes and returns both have values of 0.

Go ahead and copy the above macro into your `addTwo.huff` file. Run `huffc addTwo.huff --bytecode`.

Congratulations you've just compiled your first contract!

The output of the compiler in the console will yield the following bytecode `600f8060093d393df36000356020350160005260206000f3`.

When you deploy this contract code it will have the runtime bytecode of the main macro we just created! In the above snippet you will find it after the first `f3` (the preceding bytecode is boiler plate constructor logic.)
That leaves us with this: `6000356020350160005260206000f3`
Below we will expand this example and analyze what you have just created!

```
 BYTECODE          MNEMONIC         STACK                 ACTION
 60 00          // PUSH1 0x00       // [0x00]
 35             // CALLDATALOAD     // [number1]          Store the first 32 bytes on the stack               
 60 20          // PUSH1 0x20       // [0x20, number1] 
 35             // CALLDATALOAD     // [number2, number1] Store the second 32 bytes on the stack
 01             // ADD              // [number2+number1]  Take two stack inputs and add the result
 60 00          // PUSH1 0x00       // [0x0, (n2+n1)]
 52             // MSTORE           // []                 Store (n2+n1) in the first 32 bytes of memory
 60 20          // PUSH1 0x20       // [0x20]
 60 00          // PUSH1 0x00       // [0x20, 0x00]
 f3             // RETURN           // []                 Return the first 32 bytes of memory
```

*What calldata to send*

In the next section we will walk through your contract's execution given that we are providing the calldata for 2 + 3. To do this we would sent two uint256's to the contract through calldata. The number 2 would become `0000000000000000000000000000000000000000000000000000000000000002` and the number 3 would become `0000000000000000000000000000000000000000000000000000000000000003`. 

This is illustrated in the table below:
| Type      | Value | As calldata |
| ----------- | ----------- | ----------- |
| uint256      | 2       |  0000000000000000000000000000000000000000000000000000000000000002         |
| uint256   | 3        |   0000000000000000000000000000000000000000000000000000000000000003        |

By putting the two together, we will send the following calldata to the contract. `0x00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003`

#### Execution Walk Through
***Line 1***
```
0x00 calldataload
```
This line reads the first 32 bytes of calldata onto the stack. The `calldataload` opcode takes a calldata offset from the stack as it's input and returns 32bytes from that offset onto the stack.

*Stack after operation*
```
[2]
```

***Line 2***
```
0x20 calldataload
```

Similarly, the second line reads the second 32 bytes of our calldata. By pushing the hex number  `0x20` (32) onto the triggering `calldataload`.

*Stack after operation* 
```
[3,2]
```

***Line 3***
```
add
```
The third line of our calls the add opcode. This will take the top two items from the stack as inputs and return the sum of those two numbers. For the inputs `[3,2]` the result is `[5]`

*Stack after operation*
```
[5]
```

***Lines 4 and 5***
The remainder of the contract is concerned with returning the result. EVM contracts can only return values that have been stored within the current executions memory frame. This is as the return opcode takes two values as inputs. The offset of memory to start returning from, and the length of memory to return. 
In this case it will the `return` opcode will consume `[0x20, 0x00]`. Or 32 bytes in memory starting from byte 0.

This explains what `0x00 mstore` is there for. `mstore` takes two items from the stack, `[location_in_memory, value]`. In our case we have `[0x00, 0x5]`, this stores the value 5 into memory.


### Interacting with this contract externally
As mentioned before, EVM contracts use an ABI to determine which function should be called on the receiving contract. Currently, people interacting with our contract can only get the functionality of adding two numbers. Most contracts will want to do have more than one function. In order to accommodate for this we will have to do a little bit of restructuring. 

The contract abi specification dictates that contract calls will append a 4 byte value (function selector) to their messages to determine which contract function the caller is intending to interact with. If you are curious as to what these look like you can find a registry of common 4byte function selectors in the [4 byte directory](https://www.4byte.directory/).

**Modifying our contract to accept external function calls**
To modify our contract to accept external calls for multiple functions we will add extract our `addTwo` logic into another macro. Then convert our `MAIN` macro into a function dispatcher.  
```huff
#define function addTwo(uint256,uint256) view returns(uint256)

#define macro MAIN() = takes(0) returns(0) {
    
    // Get the function selector
    0x00 
    calldataload 
    0xE0 
    shr
    
    // Jump to the implementation of the ADD_TWO function if the calldata matches the function selector
    __FUNC(addTwo) addTwo eq jumpi  

    addTwo:
        ADD_TWO()
}

#define macro ADD_TWO() = takes(0) returns(0) {
    0x04 calldataload     // load first 32 bytes onto the stack - number 1
    0x24 calldataload     // load second 32 bytes onto the stack - number 2
    add                   // add number 1 and 2 and put the result onto the stack
    
    0x00 mstore           // place the result in memory
    0x20 0x00 return      // return the result
}
```

The first modifications we make will be within the ADD_TWO macro. On lines 1 and 2 we will shift the calldata offset by 4 bytes for both numbers, this is due to the 4 byte function selector that will be prepended to the calldata value. 

Our `MAIN` macro has changed drastically. 
The first 4 lines are concerned with isolating the function selector from the calldata.
1. `0x00` pushed `[0]` onto the stack
2. `calldataload` takes `[0]` as input and pushes the first 32 bytes of calldata onto the stack
3. `0xE0` pushes `[224]` onto the stack. This magic number represents 256 bits - 32 bits (32 bytes - 4 bytes). 
4. When followed by the shr this will place the function selector onto the stack

The following lines will match the function selector on the stack and then jump to the code location where that code exists. Huff handles generating all jump logic for you.

Under the hood the ADD_TWO() macro bytecode will be inlined of ADD_TWO() in the main macro. 

Now you should be able to use libraries like ethers, or other contracts to call your huff contract! 

We hope this now gives you a good understanding of the main concepts and all of the boiler plate you need to get started in huff!

**Hello, world!**
Earlier we mentioned how `"Hello, world!"` is quite an advanced concept for huff. The reason being that we have to clear understanding of EVM string encoding. As strings are dynamic types it is not as simple as returning the UTF-8 values for `"Hello, world!"` (`0x48656c6c6f2c20776f726c6421`). In the abi standard, dynamic types are encoded in 3 parts.
1. The offset of the dynamic data.
2. The length of the dynamic data.
3. The values of the dynamic data.

Each part will look as follows when returning the string `"Hello, world!"`:
```
0x0000000000000000000000000000000000000000000000000000000000000020 // The location of the "Hello, world!" data (dynamic type).
```
```
0x000000000000000000000000000000000000000000000000000000000000000d // The length of "Hello, world!" in bytes
```
```
0x48656c6c6f2c20776f726c642100000000000000000000000000000000000000 // Value "Hello, world!"
```

Encoding dynamic values takes alot of work!! In order to return `"Hello, world!"` we must return 96 bytes!.

The following `MAIN` macro does this in as a concise a way as possible.
```
#define macro MAIN() = takes(0) returns(0) {
    0x0d48656c6c6f2c20776f726c6421  // "Hello, world1"
    0x2d                            // store hello world at offset
    mstore
    
    0x20 0x00 mstore                // store dynamic offset at 0x00 (starts at 0x20)
    0x60 0x00 return                // return 96 byte value
}
```

### Putting them all together

Finally we want to end up with a contract that has multiple functions in it. One that supports both the hello world function and addTwo. 
Our contract would look like this: 

```
#define function addTwo(uint256,uint256) view returns(uint256)
#define function helloWorld() view returns(string)

#define macro MAIN() = takes(0) returns(0) {
    0x00 calldataload 0xE0 shr

    dup1 0x0f52d66e eq addtwo jumpi
    dup1 0xc605f76c eq helloWorld jumpi

    addtwo:
        ADD_TWO()
    helloWorld:
        HELLO_WORLD()

    0x00 dup1 revert  // revert if no function is called
}

#define macro HELLO_WORLD = takes(0) returns(0) {
      // len("Hello, world!") == 0x0d
    0x0d48656c6c6f2c20776f726c6421    // "Hello, world1"
    0x2d                              // store hello world at offset
    mstore
    
    0x20 0x00 mstore                // store dyn ofst at 0x00 (starts at 0x20)
    0x60 0x00 return
}

#define macro ADD_TWO() = takes(0) returns(0) {
    0x04 calldataload     // load first 32 bytes onto the stack - number 1
    0x24 calldataload     // load second 32 bytes onto the stack - number 2
    add                   // add number 1 and 2 and put the result onto the stack
    
    0x00 mstore           // place the result in memory
    0x20 0x00 return      // return the result
}
```

Now you have created a fully functioning huff contract! Compile it, use it and try to break it!

