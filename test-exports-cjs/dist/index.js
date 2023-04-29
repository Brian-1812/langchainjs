"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const openai_1 = require("langchain/llms/openai");
const chains_1 = require("langchain/chains");
const prompts_1 = require("langchain/prompts");
const load_1 = require("langchain/prompts/load");
const hnswlib_1 = require("langchain/vectorstores/hnswlib");
const openai_2 = require("langchain/embeddings/openai");
const docstore_1 = require("langchain/docstore");
const csv_1 = require("langchain/document_loaders/fs/csv");
async function test() {
    // Test exports
    (0, assert_1.default)(typeof openai_1.OpenAI === "function");
    (0, assert_1.default)(typeof chains_1.LLMChain === "function");
    (0, assert_1.default)(typeof load_1.loadPrompt === "function");
    (0, assert_1.default)(typeof prompts_1.ChatPromptTemplate === "function");
    (0, assert_1.default)(typeof hnswlib_1.HNSWLib === "function");
    // Test dynamic imports of peer dependencies
    const { HierarchicalNSW } = await hnswlib_1.HNSWLib.imports();
    const vs = new hnswlib_1.HNSWLib(new openai_2.OpenAIEmbeddings({ openAIApiKey: "sk-XXXX" }), {
        space: "ip",
        numDimensions: 3,
        docstore: new docstore_1.InMemoryDocstore(),
        index: new HierarchicalNSW("ip", 3),
    });
    await vs.addVectors([
        [0, 1, 0],
        [0, 0, 1],
    ], [
        new docstore_1.Document({
            pageContent: "a",
        }),
        new docstore_1.Document({
            pageContent: "b",
        }),
    ]);
    (0, assert_1.default)((await vs.similaritySearchVectorWithScore([0, 0, 1], 1)).length === 1);
    // Test CSVLoader
    const loader = new csv_1.CSVLoader(new Blob(["a,b,c\n1,2,3\n4,5,6"]));
    const docs = await loader.load();
    (0, assert_1.default)(docs.length === 2);
}
test()
    .then(() => console.log("success"))
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
