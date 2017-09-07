// ConsoleApplication1.cpp : Defines the entry point for the console application.
//



#include <sstream>
#include <fstream>
#include <string.h>
#include <stdio.h>
#include <iostream>
#include <assert.h>
#ifndef _MSC_FULL_VER
#include <emscripten.h>
#endif
#include	"gsm.h"


using namespace std;

int	debug = 0;
int	verbosity = 0;
int	fast = 0;
int	wav = 0;
int	error = 0;

gsm_frame	buf;
gsm_signal	source[160];

int		cc;
gsm		r;
int		nr = 0;

void Initialize() {
    (void)memset(source, 0x00, sizeof(source));

    if (!(r = gsm_create())) {
        perror("gsm_create");
        error = 1;
        return;
    }
    gsm_option(r, GSM_OPT_VERBOSE, &verbosity);
    gsm_option(r, GSM_OPT_FAST, &fast);
    gsm_option(r, GSM_OPT_WAV49, &wav);	
}


int decode_block(unsigned char *buf, int inputLength, unsigned char *outputBuf) {

    int inputOffset = 0;
    int frame_size = 33;
    int outputLength = 0;
    unsigned char frame[33];
    
    while (inputOffset < inputLength)
    {
        memcpy(frame, buf + inputOffset, frame_size);
        // setup for next frame
        if (frame_size == 33)
        {
            inputOffset += 33;
            frame_size = 32;
        }
        else
        {
            inputOffset += 32;
            frame_size = 33;
        }
        gsm_decode(r, frame, source);
        memcpy(outputBuf, source, 320);
        outputBuf += 320;
        outputLength += 320;
    }
    return outputLength;
}

int main(int argc, char* argv[])
{
#ifndef _MSC_FULL_VER
    EM_ASM(
        FS.mkdir('/mounted');
    FS.mount(NODEFS, { root: '.' }, '/mounted');
    );

#endif

    
    stringstream memoryStream(ios_base::in | ios_base::out | ios_base::binary);
    printf("Hello Nena\n");
#ifndef _MSC_FULL_VER
    ifstream in("/mounted/gate10.wav", ios::out | ios::binary);
    ofstream out("/mounted/gate10.decode.node.raw", ios::out | ios::binary);
#else
    ifstream in("gate10.wav", ios::out | ios::binary);
    ofstream out("gate10.decode.raw", ios::out | ios::binary);
#endif
    in.seekg(0, ios::end);
    int totalBytes = in.tellg();
    
    // seek 60 bytes in
    in.seekg(0, ios::beg);
    
    int bytesRead = 0;
    
    int blocksize = 65;
    int expandedBlockSize = 320 * sizeof(short);

    unsigned char *encodedBuffer = (unsigned char*)malloc(blocksize);
    unsigned char *decodedBuffer = (unsigned char*)malloc(expandedBlockSize);

    int totalDecoded = 0;
    int bytesToRead = blocksize;

    Initialize();
    in.read((char*)encodedBuffer, 60);
    bytesRead += 60;

    cout << in.tellg() << endl;

    while(bytesRead < totalBytes)
    {
    
        if(!in.good())
        {
            printf("fuck.");
            break;
        }
        if(bytesRead + bytesToRead > totalBytes)
            bytesToRead = totalBytes - bytesRead;
        in.read((char*)encodedBuffer, bytesToRead);
        bytesRead += bytesToRead;
        
        int decoded = decode_block(encodedBuffer, bytesToRead, decodedBuffer);
        out.write((char*)decodedBuffer, expandedBlockSize);
        memoryStream.write((char*)decodedBuffer, expandedBlockSize);

        totalDecoded += decoded;
    }
    
    //printf("Checksum is %#x\n", checksum((void *)memoryStream.str().c_str(), totalDecoded, 0));
    printf("Finished with %d \n", (int)out.tellp());
    
    
    if(encodedBuffer != NULL)
        free(encodedBuffer);
    if(decodedBuffer != NULL)
        free(decodedBuffer);
    in.close();
    out.flush();
    out.close();

    return 0;
}


unsigned checksum(void *buffer, size_t len, unsigned int seed)
{
    unsigned char *buf = (unsigned char *)buffer;
    size_t i;

    for (i = 0; i < len; ++i)
        seed += (unsigned int)(*buf++);
    return seed;
}


int main0(int argc, char* argv[])
{
    stringstream memoryStream(ios_base::in | ios_base::out | ios_base::binary);
    printf("Hello Nena\n");
    ifstream in("gate10.decode.raw", ios::out | ios::binary);
    in.seekg(0, ios::end);
    int totalBytes = in.tellg();

    // seek 60 bytes in
    in.seekg(0, ios::beg);
    int blocksize = 65;
    int bytesToRead = blocksize;

    int bytesRead = 0;

    unsigned char *encodedBuffer = (unsigned char*)malloc(blocksize);

    in.read((char*)encodedBuffer, 60);
    bytesRead += 60;

    while (bytesRead < totalBytes)
    {
        if (bytesRead + bytesToRead > totalBytes)
            bytesToRead = totalBytes - bytesRead;
        in.read((char*)encodedBuffer, bytesToRead);
        bytesRead += bytesToRead;

        memoryStream.write((char*)encodedBuffer, bytesToRead);

    }
    in.close();

    printf("Checksum is %#x\n", checksum((void *)memoryStream.str().c_str(), bytesRead, 0));
    return 0;
}