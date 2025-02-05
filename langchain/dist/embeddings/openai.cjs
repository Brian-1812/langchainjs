"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIEmbeddings = void 0;
const openai_1 = require("openai");
const axios_fetch_adapter_js_1 = __importDefault(require("../util/axios-fetch-adapter.cjs"));
const chunk_js_1 = require("../util/chunk.cjs");
const base_js_1 = require("./base.cjs");
class OpenAIEmbeddings extends base_js_1.Embeddings {
    constructor(fields, configuration) {
        super(fields ?? {});
        Object.defineProperty(this, "modelName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "text-embedding-ada-002"
        });
        Object.defineProperty(this, "batchSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 512
        });
        Object.defineProperty(this, "stripNewLines", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "timeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "clientConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const apiKey = fields?.openAIApiKey ??
            // eslint-disable-next-line no-process-env
            (typeof process !== "undefined" ? process.env.OPENAI_API_KEY : undefined);
        if (!apiKey) {
            throw new Error("OpenAI API key not found");
        }
        this.modelName = fields?.modelName ?? this.modelName;
        this.batchSize = fields?.batchSize ?? this.batchSize;
        this.stripNewLines = fields?.stripNewLines ?? this.stripNewLines;
        this.timeout = fields?.timeout;
        this.clientConfig = {
            apiKey,
            ...configuration,
        };
    }
    async embedDocuments(texts) {
        const subPrompts = (0, chunk_js_1.chunkArray)(this.stripNewLines ? texts.map((t) => t?.replaceAll("\n", " ")) : texts, this.batchSize);
        const embeddings = [];
        for (let i = 0; i < subPrompts.length; i += 1) {
            const input = subPrompts[i];
            const { data } = await this.embeddingWithRetry({
                model: this.modelName,
                input,
            });
            for (let j = 0; j < input.length; j += 1) {
                embeddings.push(data.data[j].embedding);
            }
        }
        return embeddings;
    }
    async embedQuery(text) {
        const { data } = await this.embeddingWithRetry({
            model: this.modelName,
            input: this.stripNewLines ? text?.replaceAll("\n", " ") : text,
        });
        return data.data[0].embedding;
    }
    async embeddingWithRetry(request) {
        if (!this.client) {
            const clientConfig = new openai_1.Configuration({
                ...this.clientConfig,
                baseOptions: {
                    timeout: this.timeout,
                    adapter: axios_fetch_adapter_js_1.default,
                    ...this.clientConfig.baseOptions,
                },
            });
            this.client = new openai_1.OpenAIApi(clientConfig);
        }
        return this.caller.call(this.client.createEmbedding.bind(this.client), request);
    }
}
exports.OpenAIEmbeddings = OpenAIEmbeddings;
