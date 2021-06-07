/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */
/* eslint-disable no-shadow */

"use strict";

/**
 * Verify that wasm frame(s) can be requested from the client.
 */

add_task(
  threadFrontTest(async ({ threadFront, debuggee }) => {
    await threadFront.reconfigure({
      observeAsmJS: true,
    });

    await executeOnNextTickAndWaitForPause(
      () => evalCode(debuggee),
      threadFront
    );

    const frameResponse = await threadFront.getFrames(0, null);

    Assert.equal(frameResponse.frames.length, 4);

    const wasmFrame = frameResponse.frames[1];
    Assert.equal(wasmFrame.type, "wasmcall");
    Assert.equal(wasmFrame.this, undefined);

    const location = wasmFrame.where;
    const source = await getSourceById(threadFront, location.actor);
    Assert.equal(location.line > 0, true);
    Assert.equal(location.column > 0, true);
    Assert.equal(/^wasm:(?:[^:]*:)*?[0-9a-f]{16}$/.test(source.url), true);

    threadFront.resume();
  })
);

function evalCode(debuggee) {
  /* eslint-disable comma-spacing, max-len */
  debuggee.eval(
    "(" +
      function() {
        // WebAssembly bytecode was generated by running:
        // js -e 'print(wasmTextToBinary("(module(import \"a\" \"b\")(func(export \"c\")call 0))"))'
        const m = new WebAssembly.Module(
          new Uint8Array([
            0,
            97,
            115,
            109,
            1,
            0,
            0,
            0,
            1,
            132,
            128,
            128,
            128,
            0,
            1,
            96,
            0,
            0,
            2,
            135,
            128,
            128,
            128,
            0,
            1,
            1,
            97,
            1,
            98,
            0,
            0,
            3,
            130,
            128,
            128,
            128,
            0,
            1,
            0,
            6,
            129,
            128,
            128,
            128,
            0,
            0,
            7,
            133,
            128,
            128,
            128,
            0,
            1,
            1,
            99,
            0,
            1,
            10,
            138,
            128,
            128,
            128,
            0,
            1,
            132,
            128,
            128,
            128,
            0,
            0,
            16,
            0,
            11,
          ])
        );
        const i = new WebAssembly.Instance(m, {
          a: {
            b: () => {
              debugger;
            },
          },
        });
        i.exports.c();
      } +
      ")()"
  );
}