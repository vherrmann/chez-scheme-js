# scheme-js
Chez Scheme on the web

## How to build Chez Scheme

We use Racket's modified Chez Scheme, which has support for compilation to WASM via Emscripten.

You will need `gcc`, `make`, `sh`, and similar programs. If ydou are using Windows, we recommend using WSL.

1. [Install Emscripten](https://emscripten.org/docs/getting_started/downloads.html)
2. Clone [Racket](https://github.com/racket/racket), or just [Racket's Chez Scheme](https://github.com/racket/ChezScheme)
3. Navigate to `racket/src/ChezScheme` (for racket/racket), or just the root directory (for racket/ChezScheme)
4. Run `./configure --emscripten`
    * Add the `--empetite` flag for Petite Chez Scheme
5. Run `make`
6. Navigate to `em-pb/c`
7. Run `emcc -DDISABLE_ICONV -s USE_ZLIB=1 -O2 -Wpointer-arith -Wall -Wextra -Wno-implicit-fallthrough -s EXIT_RUNTIME=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -o ../bin/pb/scheme.js ../boot/pb/main.o ../boot/pb/libkernel.a ../lz4/lib/liblz4.a`
8. Copy `scheme.wasm` and `scheme.js` from `em-pb/bin/pb`, and `scheme.boot` and `petite.boot` from `em-pb/boot/pb` into `chez` (in scheme-js)
    * If you used `--empetite` you do not need `scheme.boot`.
    * If you're having trouble copying the boot files because they're symbolic links, the original files are in `em-pb/c`.
9. Run `node process-scheme.js`

Note: Step 7 is included because while the default Scheme-emscripten build is intended to work out-of-the-box, we do our own special stuff and so we don't want the boot files to be hard-coded and packed into one file.