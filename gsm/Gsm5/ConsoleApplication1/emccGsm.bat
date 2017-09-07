emcc -v ConsoleApplication1.cpp add.c code.c debug.c decode.c gsm_create.c gsm_decode.c gsm_destroy.c gsm_encode.c gsm_explode.c gsm_implode.c gsm_option.c gsm_print.c long_term.c lpc.c preprocess.c rpe.c short_term.c table.c -o gsm.js -s TOTAL_MEMORY=32000000 -s EXPORTED_FUNCTIONS="['_Initialize','_decode_block']" -s NO_EXIT_RUNTIME=1 -O0 -s AGGRESSIVE_VARIABLE_ELIMINATION=1 -s FORCE_ALIGNED_MEMORY=1 -s INLINING_LIMIT=1