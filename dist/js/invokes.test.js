/**
 * @jest-environment jsdom
 */

// import { mockIPC, clearMocks } from "@tauri-apps/api/mocks";
// import { invoke } from "@tauri-apps/api/tauri";
// import {randomFillSync} from "crypto"
// import {initializeVSCode} from "./helpers"

// const path = "C:\\Projects\\Python\\"

// beforeAll(() => {
//     //@ts-ignore
//     window.crypto = {
//         getRandomValues: function (buffer) {
//             return randomFillSync(buffer);
//         },
//     };
// });

// afterEach(() => {
//   clearMocks();
// });

// test("invoke simple", async () => {
//   mockIPC((cmd, args) => {
//     if (cmd === "add") {
//       return args.a + args.b;
//     }
//     if (cmd == "open_vs_code") {
//       return openVSCode()
//     }
//   });

//   expect(invoke("add", { a: 12, b: 15 })).resolves.toBe(27);
//   expect(invoke("open_vs_code")).resolves.toBe('fufilled')

// });
