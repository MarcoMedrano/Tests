var input = new Uint32Array(65); for( i = 0; i<65; i++) input[i] = 5;
input[64] = 99;
var inputPtr = Module._malloc(input.length*input.BYTES_PER_ELEMENT);
Module.HEAPU8.set(input, inputPtr);

var output = new Uint32Array(640);
var buf = Module._malloc(output.length*output.BYTES_PER_ELEMENT);

Module.ccall('init', 'number', [], [])
console.log('JS - buf*', buf);
console.log('JS - Before &buf', getValue(buf, 'i32'));
Module.ccall('decode', 'number', ['pointer', 'number', 'pointer'], [inputPtr, 65, buf]);

res = '';
for (var i = 0; i < 640; i++) {
    res += getValue(buf + (i*4), 'i32');
};

console.log("JS - " + res);

//console.log('JS - &buf', getValue(buf, 'i32'));
