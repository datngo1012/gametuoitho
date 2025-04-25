# freej2me-web
Here it is.. the browser version of my [fork of freej2me](https://github.com/zb3/freej2me)!  

This uses [CheerpJ](https://cheerpj.com/) (pretty cool) to run Java in a web browser :)
Running in the browser means you can now safely load any JAR file, since malicious JAR files won't be able to cause any damage thanks to the web platform sandbox.

## Let's play!
https://zb3.github.io/freej2me-web/


### Keyboard controls
| **Key** | **Functions As** |
| :------------: | :--------------: |
| <kbd>Esc</kbd> | Enter/exit freej2me options |
| <kbd>F1</kbd> or <kbd>Q</kbd> | Left soft key |
| <kbd>F2</kbd> or <kbd>W</kbd> | Right soft key |
| <kbd>0</kbd> to <kbd>9</kbd> | Keypad Numbers |
| Numpad keys | Numbers with keys 123 and 789 swaped |
| <kbd>E</kbd> | * |
| <kbd>R</kbd> | # |
| <kbd>↑</kbd> | Up |
| <kbd>↓</kbd> | Down |
| <kbd>←</kbd> | Left |
| <kbd>→</kbd> | Right |
| <kbd>⏎ Enter</kbd> | Action key (OK button) |

#### Phone types and key mappings
Keys like left/right soft, arrows and the action key have different vendor-specific mappings. By default, freej2me uses the most common **Nokia** mapping, but this can be changed in settings by changing the `Phone type`. Note that in the `Standard` phone, arrow keys are mapped to 2, 4, 6, 8 and the enter key is mapped to 5.

When using the numpad keys, the 123 and 789 rows are swapped so as to resemble the key layout on a mobile phone.

## Game doesn't work?
If a game doesn't work, first try changing the settings. Press the <kbd>Esc</kbd> key, change some settings and then restart the game. Try changing these:
* display size
* compatibility flags
* sound (turn off)

If it still doesn't work you can get more information by looking at the console. Note however that **not every game will work with this emulator**. You can report a bug though.


## What's inside
* My fork of FreeJ2ME

* Graphics APIs implemented in JS using 2d canvas rendering context (faster than CheerpJ AWT)

* 3D support
    - Implemented using WebGL 2
    - M3G from KEmulator rewritten to use OpenGL ES 2, then optimized
    - Mascot Capsule v3 support from JL-Mod, optimized

* MIDI playback (`libmidi`)
    - modified and debloated fluidsynth compiled to WebAssembly
    - WebAudio API + AudioWorkletNode

* Media playback (`libmedia`)
    - ffmpeg compiled to WebAssembly (to decode formats like amr)
    - rudimentary - the file is fully converted before anything can be played
    - uses a `<video>` tag to play.. "usually" audio :)

## Building

On the host, you need to have docker installed, currently the image assumes a linux host.

After cloning, build the builder image:
```
docker build --build-arg UID=$(id -u) -t freej2me-web-builder builder_image
```

Build the jar like this:
```
docker run --rm -it -uzb3 -w /app -v`pwd`:/app freej2me-web-builder ant
```

In case you want to rebuild `libmidi` / `libmedia` wasm files, build them like this:
```
docker run --rm -it -uzb3 -w /app -v`pwd`:/app freej2me-web-builder web/libmedia/transcode/wasm/build.sh --release
docker run --rm -it -uzb3 -w /app -v`pwd`:/app freej2me-web-builder web/libmidi/wasm/build.sh --release
```

## Serving locally
Thanks to CheerpJ requirements regarding requests with the `Range` header, this is.. not that obvious. In practice, if you just want to serve locally, this one-liner seems to work:
```
npx serve -u web
```

## CheerpJ?
freej2me-web currently works in the browser thanks to CheerpJ. However, since CheerpJ is proprietary, it introduces some limitations.. notably freej2me-web will not work without an internet connection, and it can be a little slow..

However, freej2me-web intentionally doesn't use its more advanced features like AWT GUI support or wasm JNI modules. In theory it should be possible to port it to a simpler (but most likely slower) VM if CheerpJ stops being available... but it's not planned for now.
