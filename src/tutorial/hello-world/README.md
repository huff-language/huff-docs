# Hello, world!

Note: This section is a continuation of ['The Basics'](/tutorial/the-basics/). If you have not read it yet we recommend you take a look at it before continuing!

---


Within ['The Basics'](/tutorial/the-basics/) we mentioned how `"Hello, world!"` is quite an advanced concept for Huff. The reason being that we have to an understanding of how string's are encoded in the EVM.
## Primer: ABI Encoding 
As strings are dynamic types it is not as simple as returning the UTF-8 values for `"Hello, world!"` (`0x48656c6c6f2c20776f726c6421`). In the ABI standard, dynamic types are encoded in 3 parts.
1. The offset of the dynamic data. (A pointer to the start of the dynamic data (uint256))
2. The length of the dynamic data. (uint256)
3. The values of the dynamic data. (dynamic length)

Each part will look as follows for the string `"Hello, world!"`:
```
[Byte number]   [DATA]    
0x00            0000000000000000000000000000000000000000000000000000000000000020 // The location of the "Hello, world!" data (dynamic type).
0x20            000000000000000000000000000000000000000000000000000000000000000d // The length of "Hello, world!" in bytes
0x40            48656c6c6f2c20776f726c642100000000000000000000000000000000000000 // Value "Hello, world!"
```

Encoding dynamic values takes alot of work!! In order to return `"Hello, world!"` we must return 96 bytes!

You might think that we can populate the memory in sequential order starting with the location (0x00), then length (0x20), and then the value (0x40), however, this would result in the value "Hello, world!" being left padded, so we would get: 
```
[Byte number]   [DATA]    
0x00            0000000000000000000000000000000000000000000000000000000000000020 // The location of the "Hello, world!" data (dynamic type).
0x20            000000000000000000000000000000000000000000000000000000000000000d // The length of "Hello, world!" in bytes
0x40            0000000000000000000000000000000000000048656c6c6f2c20776f726c6421 // Wrong encoding!
```
And that's not what we need. Instead, we're going to leverage what we know about memory to produce the right result, and that is:
- Memory is always expanded in 32 byte increments
- We can store a value starting from any index
- We want to store the location starting at 0x00 and the length starting at 0x20
- Values are left padded

Armed with that knowledge, we can store the value "Hello, world!" at 0x2d (starting index of length 0x20 + the length of the data in bytes 0x0d). That will give us the first 0x2d (decimal 45) bytes as zeroes due to memory expansion, and since the value is left padded and of length 0x0d (decimal 13) bytes we get another 19 bytes of zeroes, equalling to 64 bytes. 

This means our actual important bytes start at 0x40, but since memory is expanded in 32 byte increments we get right padded zeroes until 0x60, equalling 96 bytes, exactly what we need! 
```
[Byte number]   [DATA]    
0x00            0000000000000000000000000000000000000000000000000000000000000000 // Empty
0x20            0000000000000000000000000000000000000000000000000000000000000000 // Empty
0x40            48656c6c6f2c20776f726c642100000000000000000000000000000000000000 // Correct encoding 
```

After this all we need to do is store the length of the data in 0x20, and the location of the data in 0x00 and we have what we want! Now let's see what that looks like in code.

## Implementation
The following `MAIN` macro steps through this encoding in a clear way (gas optimization will be left as an exercise to the reader!)
```
#define macro MAIN() = takes(0) returns(0) {
    // Store string "Hello, world1" in memory at 0x40
    // 0x2d is listed as mstore pads the value
    0x48656c6c6f2c20776f726c6421        // ["Hello, world!"]
    0x2d                                // ["Hello, world!", 0x2d]
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

Have a look how memory is set and what is returned interactively within the [evm.codes playground](https://www.evm.codes/playground?unit=Wei&codeType=Bytecode&code='6c48656c6c6f2c20776f726c6421~2dz0d~20z20~00z~~00f3'~60z52~%01z~_) for this example.
