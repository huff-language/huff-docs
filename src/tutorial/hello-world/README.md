## Hello, world?

### Getting Started

Before you get started writing Huff you will have to install the compiler. Head over to [getting started](https://docs.Huff.sh/get-started/overview/) and follow the steps to get it installed.
Once that is done - come back here!! 

### What you are going to learn?
Unlike other programming languages, creating a Huff contract that returns "Hello, world!" is quite advanced! To keep things simple we are first going to learn how to create a Huff contract that adds two numbers (then we will dive into "Hello, world!").
Open up your editor and create a file called `addTwo.Huff`. Lets jump in. 

## Add Two
### ABI declaration
First things first. If you're coming from a higher level language like Solidity or Vyper you will be familiar with defining "external" or "public" functions to allow you to interact with your contract with external tools by generating an ABI (Application Binary Interface). This tells external tools or software languages how to target specific functions within a contract (We will dive more into this later). Huff is exactly the same, you can declare functions that will appear in the abi at the top of the file. 

```Huff
#define function addTwo(uint256, uint256) view returns(uint256)
```

Go ahead and paste the above example at the top of `addTwo.Huff`. This means that we are declaring a function that takes two `uint256` inputs and returns a single `uint256`.

### The Main Macro
The next thing we are going to create is the `main macro`. This serves as the entry point for our contract. All calls to your deployed contract (regardless of what function they are calling) will start from here! In this example we will define a MAIN function that will read two `uint256`'s from calldata and return their result.

```Huff
#define macro MAIN() = takes(0) returns(0) {
    0x00 calldataload     // [number1] // load first 32 bytes onto the stack - number 1     
    0x20 calldataload     // [number2] // load second 32 bytes onto the stack - number 2
    add                   // [number1+number2] // add number 1 and 2 and put the result onto the stack
    
    0x00 mstore           // place [number1 + number2] in memory
    0x20 0x00 return      // return the result
}
```

Looking at the above snippet may be intimidating at first, but bear with us.

You'll notice that the MAIN directive is annotated with `takes(0) returns(0)`. As the EVM is a stack based virtual machine [https://docs.huff.sh/tutorial/evm-basics/](see more), all macro declarations are annotated with the amount of stack items they will consume (take) and what they will add to the stack afterwards (returns). As this is the entry point to the program, and the stack is empty and we will not be leaving anything on the stack after execution, therefore takes and returns both have values of 0.

Go ahead and copy the above macro into your `addTwo.Huff` file. Run `huffc addTwo.Huff --bytecode`.

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

If you want to step through the execution yourself you can check out this snippet interactively in [evm.codes](https://www.evm.codes/playground?unit=Wei&codeType=Bytecode&code='~3560203501~526020~f3'~6000%01~_) (click RUN to get started). If you are new to working with assembly I strongly suggest you do this as visualizing it helps tremendously with learning. 

*What calldata to send*

In the next section we will walk through your contract's execution given that we are providing the calldata for 2 + 3. To do this we would sent two uint256's to the contract through calldata. The number 2 would become `0000000000000000000000000000000000000000000000000000000000000002` and the number 3 would become `0000000000000000000000000000000000000000000000000000000000000003`. 

This is illustrated in the table below:
| Type      | Value | As calldata |
| ----------- | ----------- | ----------- |
| uint256      | 2       |  0000000000000000000000000000000000000000000000000000000000000002         |
| uint256   | 3        |   0000000000000000000000000000000000000000000000000000000000000003        |

By putting the two together, we will send the following calldata to the contract. `0x00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003`

### Execution Walk Through
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
In this case the `return` opcode will consume `[0x20, 0x00]`. Or 32 bytes in memory starting from byte 0.

This explains what `0x00 mstore` is there for. `mstore` takes two items from the stack, `[location_in_memory, value]`. In our case we have `[0x00, 0x5]`, this stores the value 5 into memory.


### Interacting with this contract externally
As mentioned before, EVM contracts use an ABI to determine which function should be called on the receiving contract. Currently, people interacting with our contract can only get the functionality of adding two numbers. Most contracts will want to do have more than one function. In order to accommodate for this we will have to do a little bit of restructuring. 

The contract abi specification dictates that contract calls will append a 4 byte value (function selector) to their messages to determine which contract function the caller is intending to interact with. These 4 bytes are the first 4 bytes of the keccak256 hash of the function's abi definition. For example, `addTwo(uint256,uint256)` will become `0x0f2d66e` (You can confirm this by using a command line tool such as `cast`'s `sig` command, or online sites such as [keccak256 online](https://emn178.github.io/online-tools/keccak_256.html)). If you are curious as to what these look like you can find a registry of common 4byte function selectors in the [4 byte directory](https://www.4byte.directory/).

**Modifying our contract to accept external function calls**
To modify our contract to accept external calls for multiple functions we will add extract our `addTwo` logic into another macro. Then convert our `MAIN` macro into a function dispatcher.  
```Huff
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

Now you should be able to use libraries like ethers, or other contracts to call your Huff contract! 

We hope this now gives you a good understanding of the main concepts and all of the boiler plate you need to get started in Huff!

## Hello, world!
Earlier we mentioned how `"Hello, world!"` is quite an advanced concept for Huff. The reason being that we have to clear understanding of EVM ABI string encoding. 

### Primer: ABI Encoding 
As strings are dynamic types it is not as simple as returning the UTF-8 values for `"Hello, world!"` (`0x48656c6c6f2c20776f726c6421`). In the abi standard, dynamic types are encoded in 3 parts.
1. The offset of the dynamic data. (A pointer to the start of the dynamic data (uint256))
2. The length of the dynamic data. (uint256)
3. The values of the dynamic data. (dynamic length)

Each part will look as follows when returning the string `"Hello, world!"`:
```
[Byte number]   [DATA]    
0x00            0000000000000000000000000000000000000000000000000000000000000020 // The location of the "Hello, world!" data (dynamic type).
0x20            000000000000000000000000000000000000000000000000000000000000000d // The length of "Hello, world!" in bytes
0x40            48656c6c6f2c20776f726c642100000000000000000000000000000000000000 // Value "Hello, world!"
```

Encoding dynamic values takes alot of work!! In order to return `"Hello, world!"` we must return 96 bytes!.

### Implementation
The following `MAIN` macro steps through this encoding in a clear way (gas optimization will be left as an exercise to the reader!)
```
#define macro MAIN() = takes(0) returns(0) {
    // Store string "Hello, world1" in memory at 0x40
    0x48656c6c6f2c20776f726c6421        // ["Hello, world!"]
    0x2d                                // ["Hello, world!", 0x40]
    mstore                              // []

    // store length of string at 0x20
    0x0d                                // [0x0d]
    0x20                                // [0x20, 0x0d]
    mstore                              // []
    
    // store dynamic offset at 0x00 (string encoding starts at 0x20)
    0x20                                // [0x20]
    0x00                                // [0x00, 0x20]
    mstore                              // []

    // return full 96 byte value
    0x60                                // [0x60]
    0x00                                // [0x00, 0x60]
    return                              // []
}
```

Have a look how memory is set and what is returned interactively within the [evm.codes playground](https://www.evm.codes/playground?unit=Wei&codeType=Bytecode&code='6c48656c6c6f2c20776f726c6421~2dz0d~20z20~00z~~00f3'~60z52~%01z~_).

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

Now you have created a fully functioning Huff contract! Compile it, use it and try to break it!


## Simple Storage
So far the two examples we have looked at have explored slicing bytes from calldata, storing in memory and returning values. Now we're going to address the missing piece of the puzzle that all EVM devs fear, storage.

### Storage in Huff
Thankfully working with storage isn't too complicated, Huff abstracts keeping track of storage variables through the `FREE_STORAGE_POINTER()` keyword. An example of which will be shown below:

```
#define constant STORAGE_SLOT0 = FREE_STORAGE_POINTER()
#define constant STORAGE_SLOT1 = FREE_STORAGE_POINTER()
#define constant STORAGE_SLOT2 = FREE_STORAGE_POINTER()
```

Storage slots are simply keys in a very large array where contracts keep their state. The compiler will assign `STORAGE_SLOT0` the value `0`, `STORAGE_SLOT1` the value `1` etc. at compile time. Throughout your code you just reference the storage slots the same way constants are used in any language.

### Setting storage

First define the constant that will represent your storage slot using the `FREE_STORAGE_POINTER()` keyword.
```
#define constant VALUE = FREE_STORAGE_POINTER()
```
We can then reference this slot throughout the code by wrapping it in square brackets - like so `[VALUE]`. The example below demonstrates a macro that will store the value 5 in the slot [VALUE].
```
#define macro SET_5() = takes(0) returns(0) {
    0x5             // [0x5] 
    [VALUE]         // [value_slot_pointer, 0x5]
    sstore          // []
}
```

Test this out interactively [here](https://www.evm.codes/playground?unit=Wei&codeType=Bytecode&code='6005600055'_) ([VALUE] has been hardcoded to 0)

### Reading from storage
Now you know how to write to storage, reading from storage is trivial. Simply replace `sstore` with `sload` and your ready to go. We are going to extend our example above to both write and read from storage.
```
#define macro SET_5_READ_5() = takes(0) returns(0) {
    0x5
    [VALUE]
    sstore

    [VALUE]
    sload
}
```

Nice! Once again you can test this out over at [evm.codes](https://www.evm.codes/playground?unit=Wei&codeType=Bytecode&code='6005600055600054'_). Notice how 5 reappears on the stack after executing the `sload` instruction.

### Simple Storage Implementation
Now we can read and write to storage, lets attempt the famous SimpleStorage starter contract from remix.

First off, lets create our interface:
```
#define function setValue(uint256) nonpayable returns ()
#define function getValue() nonpayable returns (uint256)
```

Now lets define our storage slots:
```
#define constant VALUE = FREE_STORAGE_POINTER()
```

Now we are at the fun part, the logic. Remember from the addTwo example we can read calldata in 32 byte chunks using the `calldataload` opcode, lets use that knowledge to get read our uint256.

```
#define macro SET_VALUE() = takes(0) returns(0) {
    // Read uint256 from calldata, remember to read from byte 4 to allow for the function selector! 
    0x04            // [0x04]
    calldataload    // [value]

    // Get pointer and store
    [VALUE]         // [value_ptr, value]
    sstore          // []
}
```

After completing the previous examples we hope that writing Huff is all starting to click! This pattern will be extremely common when writing your own contracts, reading from calldata then storing values in memory or storage.

Next up is reading the stored value. 
```
#define macro GET_VALUE = takes(0) returns(0) {
    // Read uint256 from storage
    [VALUE]         // [value_ptr]
    sload           // [value]

    // Store the return value in memory
    0x00            // [0x00, value]
    mstore          // []

    // Return the first 32 bytes of memory containing our uint256
    0x20            // [0x20]
    0x00            // [0x00, 0x20]
    return          // []
}
```
First off, we read the storage value using a similar technique to our prior example. Prepare the return value by storing it in memory. Then return the value from memory. It's all coming together!

To call our new macros from external functions we have to create a dispatcher! 
```
#define macro MAIN() = takes(0) returns(0) {
    
    // Get the function selector
    0x00 calldata 0xe0 shr

    dup1 0x55241077 eq setValue jumpi // Compare function selector to setValue(uint256)
    dup1 0x20965255 eq getValue jumpi // Compare the function selector to getValue()

    // dispatch
    setValue:
        SET_VALUE()
    getValue:
        GET_VALUE()

    0x00 0x00 revert
}
```

Now all of it together!
```
// Interface
#define function setValue(uint256) nonpayable returns ()
#define function getValue() nonpayable returns (uint256)

// Storage
#define constant VALUE = FREE_STORAGE_POINTER()

// External function macros

// setValue(uint256)
#define macro SET_VALUE() = takes(0) returns(0) {
    // Read uint256 from calldata, remember to read from byte 4 to allow for the function selector! 
    0x04            // [0x04]
    calldataload    // [value]

    // Get pointer and store
    [VALUE]         // [value_ptr, value]
    sstore          // []
}

// getValue()
#define macro GET_VALUE = takes(0) returns(0) {
    // Read uint256 from storage
    [VALUE]         // [value_ptr]
    sload           // [value]

    // Store the return value in memory
    0x00            // [0x00, value]
    mstore          // []

    // Return the first 32 bytes of memory containing our uint256
    0x20            // [0x20]
    0x00            // [0x00, 0x20]
    return          // []
}

// Main
#define macro MAIN() = takes(0) returns(0) {
    // Get the function selector
    0x00 calldata 0xe0 shr

    dup1 0x55241077 eq setValue jumpi // Compare function selector to setValue(uint256)
    dup1 0x20965255 eq getValue jumpi // Compare the function selector to getValue()

    // dispatch
    setValue:
        SET_VALUE()
    getValue:
        GET_VALUE()

    0x00 0x00 revert
}
```

Congratulations! You've made it through the crust of writing contracts in Huff. For your next steps we recommend taking what you have learned so far in addTwo, "Hello, World!" and SimpleStorage into a testing framework like [Foundry](http://localhost:8080/tutorial/huff-testing/). Happy hacking!
