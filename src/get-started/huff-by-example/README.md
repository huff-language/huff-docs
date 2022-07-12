# Huff by Example

## Introduction

Huff by Example is an effort to provide a thorough explanation of each
feature of the Huff language, along with code-snippet examples detailing how,
when, where, and why to use each one. The snippets here are heavily 
commentated, but this section does assume some prior experience working 
with the EVM.

If you are new to low-level EVM programming, please read the
[Tutorials](/tutorial/overview) section of the docs before diving into
Huff development. If you run into any issues, please feel free to come ask
the community questions on [Discord](https://discord.gg)!

## Defining your Interface

While defining an interface is not a necessary step, `functions` and `events`
can be defined in Huff contracts for two purposes: To be used as arguments 
for the `__FUNC_SIG` and `__EVENT_HASH` builtins, and to generate a Solidity 
Interface / Contract ABI.

Functions can be of type `view`, `pure`, `payable` or `nonpayable`, and
function interfaces should only be defined for externally facing functions.

Events can contain `indexed` and non-indexed values.

#### Example

```plaintext
#define function testFunction(uint256, bytes32) view returns (bytes memory)

#define event TestEvent(address indexed, uint256)
```

## Constants

Constants in Huff contracts are not included in the contract's storage; Instead,
they are able to be called within the contract at compile time. Constants
can either be bytes (32 max) or a `FREE_STORAGE_POINTER`. A `FREE_STORAGE_POINTER`
constant will always represent an unused storage slot in the contract.

In order to push a constant to the stack, use bracket notation: `[CONSTANT]`

#### Example

**Constant Declaration**
```plaintext
#define constant NUM = 0x420
#define constant HELLO_WORLD = 0x48656c6c6f2c20576f726c6421
#define constant FREE_STORAGE = FREE_STORAGE_POINTER()
```

**Constant Usage**
(without loss of generality, let's say the constant `NUM` holds 0x420 from the above example)
```plaintext
                    // [] - an empty stack
[NUM]               // [0x420] - the constant's value is pushed to the stack
```

## Jump Labels

Jump Labels are a simple abstraction included into the language to make defining
and referring to `JUMPDEST`s more simple for the developer.

#### Example

```plaintext
#define macro MAIN() = takes (0) returns (0) {
    // Store "Hello, World!" in memory
    0x48656c6c6f2c20576f726c6421
    0x00 mstore // ["Hello, World!"]

    // Jump to success label, skipping the revert statement
    success     // [success_label_pc, "Hello, World!"]
    jump        // ["Hello, World!"]

    // Revert if this point is reached
    0x00 0x00 revert

    // Labels are defined within macros or functions, and are designated
    // by a word followed by a colon. Note that while it may appear as if
    // labels are scoped code blocks due to the indentation, they are simply
    // destinations to jump to in the bytecode. If operations exist below a label,
    // they will be executed unless the program counter is altered or execution is
    // halted by a `revert`, `return`, `stop`, or `selfdestruct` opcode.
    success:
        0x00 mstore
        0x20 0x00 return
}
```

## Macros and Functions

Huff offers two ways to group together your bytecode: Macros and Functions. It is
important to understand the difference between the two, and when to use one
over the other.

### Macros

Most of the time, Huff developers should opt to use macros. Each time a macro is invoked,
the code within it is placed at the point of invocation. This is efficient in
terms of runtime gas cost due to not having to jump to and from the macro's code, 
but it can quickly increase the size of the contract's bytecode if it is used commonly
throughout.

#### Constructor and Main

`MAIN` and `CONSTRUCTOR` are two important macros that serve special purposes. When
your contract is called, the `MAIN` macro will be the fallback, and it is commonly where
the control flow of Huff contracts begin. The `CONSTRUCTOR` macro, while not required,
can be used to initialize the contract upon deployment. Inputs to the `CONSTRUCTOR` macro
are provided at compile time.

#### Macro/Function Signature
TODO

#### Macro Arguments

Macros can accept arguments to be "called" inside the macro or passed as a reference. Macro arguments may be one of: label, opcode, literal, or a constant. Since macros are inlined at compile-time, the arguments are not evaluated at runtime and are instead inlined as well.

#### Example

```plaintext
// Define the contract's interface
#define function addWord(uint256) pure returns (uint256)

// Get a free storage slot to store the owner
#define constant OWNER = FREE_STORAGE_POINTER()

// Define the event we wish to emit
#define event WordAdded(uint256 initial, uint256 increment)

// Macro to emit an event that a word has been added
#define macro emitWordAdded(increment) = takes (1) returns (0) {
    // input stack: [initial]
    <increment>              // [increment, initial]
    __EVENT_HASH(WordAdded)  // [sig, increment, initial]
    0x00 0x00                // [mem_start, mem_end, sig, increment, initial]
    log3                     // []
}

// Only owner function modifier
#define macro ONLY_OWNER() = takes (0) returns (0) {
    caller                   // [msg.sender]
    [OWNER] sload            // [owner, msg.sender]
    eq                       // [owner == msg.sender]
    is_owner jumpi           // []

    // Revert if the sender is not the owner
    0x00 0x00 revert

    is_owner:
}

// Add a word (32 bytes) to a uint 
#define macro ADD_WORD() = takes (1) returns (1) {
    // Input Stack:          // [input_num]

    // Enforce that the caller is the owner. The code of the
    // `ONLY_OWNER` macro will be pasted at this invocation. 
    ONLY_OWNER()

    // Call our helper macro that emits an event when a word is added
    // Here we pass a literal that represents how much we increment the word by.
    // NOTE: We need to duplicate the input number on our stack since
    //       emitWordAdded takes 1 stack item and returns 0
    dup1                     // [input_num, input_num]
    emitWordAdded(0x20)      // [input_num]

    // NOTE: 0x20 is automatically pushed to the stack, it is assumed to be a 
    // literal by the compiler.
    0x20                     // [0x20, input_num]
    add                      // [0x20 + input_num]

    // Return stack:            [0x20 + input_num]
}

#define macro MAIN() = takes (0) returns (0) {
    // Get the function signature from the calldata
    0x00 calldataload        // [calldata]
    0xE0 shr                 // [func_sig (calldata @ 0x00 >> 0xE0)]

    // Load first element in the calldata
    0x04 calldataload        // [input_num]

    // Check if the function signature in the calldata is
    // a match to our `addWord` function definition.
    // More about the `__FUNC_SIG` builtin in the `Builtin Functions`
    // section.
    dup1 __FUNC_SIG(addWord) // [func_sig(addWord), func_sig]
    eq                       // [func_sig(addWord) == func_sig]
    add_word jumpi           // []

    // Revert if no function signature matched
    0x00 0x00 revert

    // Create a jump label
    add_word:
        // Call the `ADD_WORD` macro with the first calldata
        // input, store the result in memory, and return it.
        0x04 calldataload    // [input_num]
        ADD_WORD()           // [result]
        0x00 mstore          // []
        0x20 0x00 return
}
```

### Functions

Functions look extremely similar to macros, but behave somewhat differently.
Instead of the code being inserted at each invocation, the compiler moves
its code to the end of the runtime bytecode, and a jump to and from that
code is inserted instead. This can be a useful abstraction when a certain
set of operations is used repeatedly throughout your contract, and it is
essentially a trade-off of decreasing contract size for a small extra
runtime gas cost (`22 + n_inputs * 3 + n_outputs * 3` gas per invocation, 
to be exact).

Functions are one of the only high-level abstractions
in Huff, so it is important to understand what the compiler adds to your code
when they are utilized. It is not always beneficial to re-use code, especially
if it is a small / inexpensive set of operations. However, for larger contracts
where certain logic is commonly reused, functions can help reduce the size of 
the contract's bytecode to below the Spurious Dragon limit.


#### Example

```plaintext
#define macro MUL_DIV_DOWN_WRAPPER() = takes (0) returns (0) {
    0x44 calldataload // [denominator]
    0x24 calldataload // [y, denominator]
    0x04 calldataload // [x, y, denominator]
    
    // Instead of the function's code being pasted at this invocation, it is put
    // at the end of the contract's runtime bytecode and a jump to the function's
    // code as well as a jumpdest to return to is inserted here. 
    //
    // The compiler looks at the amount of stack inputs the function takes (N) and
    // holds on to an array of N SWAP opcodes in descending order from 
    // SWAP1 (0x90) + N - 1 -> SWAP1 (0x90)
    //
    // For this function invocation, we would need three swaps starting from swap3
    // and going to swap1. The return jumpdest PC must be below the function's
    // stack inputs, and the inputs still have to be in order.
    // 
    // [return_pc, x, y, denominator] (Starting stack state)
    // [denominator, x, y, return_pc] - swap3
    // [y, x, denominator, return_pc] - swap2
    // [x, y, denominator, return_pc] - swap1
    //
    // After this, the compiler inserts a jump to the jumpdest inserted at the
    // start of the function's code as well as a jumpdest to return to after
    // the function is finished executing.
    //
    // Code inserted when a function is invoked:
    // PUSH2 return_pc
    // <num_inputs swap ops>
    // PUSH2 func_start_pc
    // JUMP
    // JUMPDEST <- this is the return_pc
    MUL_DIV_DOWN(err) // [result]

    // Return result
    0x00 mstore
    0x20 0x00 return

    err:
        0x00 0x00 revert
}

#define fn MUL_DIV_DOWN(err) = takes (3) returns (1) {
    // A jumpdest opcode is inserted here by the compiler
    // Starting stack: [x, y, denominator, return_pc]

    // function code ...
    
    // Because the compiler knows how many stack items the function returns (N),
    // it inserts N stack swaps in ascending order from
    // SWAP1 (0x90) -> SWAP1 (0x90) + N - 1 in order to move the return_pc
    // back to the top of the stack so that it can be consumed by a JUMP
    //
    // [result, return_pc] (Starting stack state)
    // [return_pc, result] - swap1
    //
    // Final function code:
    // 👇 func_start_pc
    // JUMPDEST           [x, y, denominator, return_pc]
    // function code ...  [result, return_pc]
    // SWAP1              [return_pc, result]
    // JUMP               [result]
}
```

## Builtin Functions
TODO

## Jump Tables
TODO

## Code Tables
TODO