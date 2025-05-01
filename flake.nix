{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils = {
      url = "github:numtide/flake-utils";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            emscripten
            gcc
          ];
          # without this emscripten tries to write to store
          shellHook = ''
            export EM_CACHE="$HOME/.emscripten_cache"
            # FIXME: https://github.com/NixOS/nixpkgs/issues/323598
            export EMCC_CFLAGS="-sMINIFY_HTML=0"
          '';
        };
      }
    );
}
