import { ReadableStream } from "stream/web";
import "./src/nock-debug.js";

global.ReadableStream = ReadableStream;
