# scheme-js
Chez Scheme on the web

## Browser

`scheme-js` uses `SharedArrayBuffer`, which requires the COOP and COEP security
headers to be set and for there to be a secure context (either localhost or https).

```http
Cross-Origin-Opener-Policy: same-origin
// And one of:
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Embedder-Policy: credentialless
```

## Node.js

Node.js is currently unsupported. There is no technical reason it couldn't be,
but figuring out a build system that will support both Node.js and browsers takes some work.
PRs to do this will be accepted.

## Development

Run `npm i` to install dependencies.

This project uses Racket's modified Chez Scheme, which has support for compilation to WASM via Emscripten.
The binaries for it are not checked in, and you will need to compile them yourself.

### Compiling Chez Scheme

You will need `gcc`, `make`, `sh`, and similar programs. If you are using Windows, I recommend using WSL.
You will also need to [install Emscripten](https://emscripten.org/docs/getting_started/downloads.html).

Once you have everything installed, run `npm run build-chez`.
This will generate a custom WebAssembly build of Chez Scheme,
copy the relevant artifacts into `src/chez`, and then patch the
JavaScript file so that `scheme-js` can interface with certain internals.

### Building

This project uses Webpack, and it can be compiled with `npm run build` or watched with `npm run watch`.

### Testing

Currently there are no automated tests. There is a playground which can be run with `npm start`
