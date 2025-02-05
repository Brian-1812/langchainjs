"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefineDocumentsChain = exports.MapReduceDocumentsChain = exports.StuffDocumentsChain = void 0;
const base_js_1 = require("./base.cjs");
const llm_chain_js_1 = require("./llm_chain.cjs");
const prompt_js_1 = require("../prompts/prompt.cjs");
/**
 * Chain that combines documents by stuffing into context.
 * @augments BaseChain
 * @augments StuffDocumentsChainInput
 */
class StuffDocumentsChain extends base_js_1.BaseChain {
    get inputKeys() {
        return [this.inputKey, ...this.llmChain.inputKeys];
    }
    get outputKeys() {
        return this.llmChain.outputKeys;
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "llmChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "input_documents"
        });
        Object.defineProperty(this, "documentVariableName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "context"
        });
        this.llmChain = fields.llmChain;
        this.documentVariableName =
            fields.documentVariableName ?? this.documentVariableName;
        this.inputKey = fields.inputKey ?? this.inputKey;
    }
    /** @ignore */
    async _call(values, runManager) {
        if (!(this.inputKey in values)) {
            throw new Error(`Document key ${this.inputKey} not found.`);
        }
        const { [this.inputKey]: docs, ...rest } = values;
        const texts = docs.map(({ pageContent }) => pageContent);
        const text = texts.join("\n\n");
        const result = await this.llmChain.call({
            ...rest,
            [this.documentVariableName]: text,
        }, runManager?.getChild());
        return result;
    }
    _chainType() {
        return "stuff_documents_chain";
    }
    static async deserialize(data) {
        if (!data.llm_chain) {
            throw new Error("Missing llm_chain");
        }
        return new StuffDocumentsChain({
            llmChain: await llm_chain_js_1.LLMChain.deserialize(data.llm_chain),
        });
    }
    serialize() {
        return {
            _type: this._chainType(),
            llm_chain: this.llmChain.serialize(),
        };
    }
}
exports.StuffDocumentsChain = StuffDocumentsChain;
/**
 * Combine documents by mapping a chain over them, then combining results.
 * @augments BaseChain
 * @augments StuffDocumentsChainInput
 */
class MapReduceDocumentsChain extends base_js_1.BaseChain {
    get inputKeys() {
        return [this.inputKey, ...this.combineDocumentChain.inputKeys];
    }
    get outputKeys() {
        return this.combineDocumentChain.outputKeys;
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "llmChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "input_documents"
        });
        Object.defineProperty(this, "documentVariableName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "context"
        });
        Object.defineProperty(this, "maxTokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 3000
        });
        Object.defineProperty(this, "maxIterations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 10
        });
        Object.defineProperty(this, "ensureMapStep", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "combineDocumentChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.llmChain = fields.llmChain;
        this.combineDocumentChain = fields.combineDocumentChain;
        this.documentVariableName =
            fields.documentVariableName ?? this.documentVariableName;
        this.ensureMapStep = fields.ensureMapStep ?? this.ensureMapStep;
        this.inputKey = fields.inputKey ?? this.inputKey;
        this.maxTokens = fields.maxTokens ?? this.maxTokens;
        this.maxIterations = fields.maxIterations ?? this.maxIterations;
    }
    /** @ignore */
    async _call(values, runManager) {
        if (!(this.inputKey in values)) {
            throw new Error(`Document key ${this.inputKey} not found.`);
        }
        const { [this.inputKey]: docs, ...rest } = values;
        let currentDocs = docs;
        for (let i = 0; i < this.maxIterations; i += 1) {
            const inputs = currentDocs.map((d) => ({
                [this.documentVariableName]: d.pageContent,
                ...rest,
            }));
            const promises = inputs.map(async (i) => {
                const prompt = await this.llmChain.prompt.format(i);
                return this.llmChain.llm.getNumTokens(prompt);
            });
            const length = await Promise.all(promises).then((results) => results.reduce((a, b) => a + b, 0));
            const canSkipMapStep = i !== 0 || !this.ensureMapStep;
            const withinTokenLimit = length < this.maxTokens;
            if (canSkipMapStep && withinTokenLimit) {
                break;
            }
            const results = await this.llmChain.apply(inputs, runManager ? [runManager.getChild()] : undefined);
            const { outputKey } = this.llmChain;
            currentDocs = results.map((r) => ({
                pageContent: r[outputKey],
            }));
        }
        const newInputs = { input_documents: currentDocs, ...rest };
        const result = await this.combineDocumentChain.call(newInputs, runManager?.getChild());
        return result;
    }
    _chainType() {
        return "map_reduce_documents_chain";
    }
    static async deserialize(data) {
        if (!data.llm_chain) {
            throw new Error("Missing llm_chain");
        }
        if (!data.combine_document_chain) {
            throw new Error("Missing combine_document_chain");
        }
        return new MapReduceDocumentsChain({
            llmChain: await llm_chain_js_1.LLMChain.deserialize(data.llm_chain),
            combineDocumentChain: await base_js_1.BaseChain.deserialize(data.combine_document_chain),
        });
    }
    serialize() {
        return {
            _type: this._chainType(),
            llm_chain: this.llmChain.serialize(),
            combine_document_chain: this.combineDocumentChain.serialize(),
        };
    }
}
exports.MapReduceDocumentsChain = MapReduceDocumentsChain;
/**
 * Combine documents by doing a first pass and then refining on more documents.
 * @augments BaseChain
 * @augments RefineDocumentsChainInput
 */
class RefineDocumentsChain extends base_js_1.BaseChain {
    get defaultDocumentPrompt() {
        return new prompt_js_1.PromptTemplate({
            inputVariables: ["page_content"],
            template: "{page_content}",
        });
    }
    get inputKeys() {
        return [this.inputKey, ...this.refineLLMChain.inputKeys];
    }
    get outputKeys() {
        return [this.outputKey];
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "llmChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "input_documents"
        });
        Object.defineProperty(this, "outputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "output_text"
        });
        Object.defineProperty(this, "documentVariableName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "context"
        });
        Object.defineProperty(this, "initialResponseName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "existing_answer"
        });
        Object.defineProperty(this, "refineLLMChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "documentPrompt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.defaultDocumentPrompt
        });
        this.llmChain = fields.llmChain;
        this.refineLLMChain = fields.refineLLMChain;
        this.documentVariableName =
            fields.documentVariableName ?? this.documentVariableName;
        this.inputKey = fields.inputKey ?? this.inputKey;
        this.outputKey = fields.outputKey ?? this.outputKey;
        this.documentPrompt = fields.documentPrompt ?? this.documentPrompt;
        this.initialResponseName =
            fields.initialResponseName ?? this.initialResponseName;
    }
    /** @ignore */
    async _constructInitialInputs(doc, rest) {
        const baseInfo = {
            page_content: doc.pageContent,
            ...doc.metadata,
        };
        const documentInfo = {};
        this.documentPrompt.inputVariables.forEach((value) => {
            documentInfo[value] = baseInfo[value];
        });
        const baseInputs = {
            [this.documentVariableName]: await this.documentPrompt.format({
                ...documentInfo,
            }),
        };
        const inputs = { ...baseInputs, ...rest };
        return inputs;
    }
    /** @ignore */
    async _constructRefineInputs(doc, res) {
        const baseInfo = {
            page_content: doc.pageContent,
            ...doc.metadata,
        };
        const documentInfo = {};
        this.documentPrompt.inputVariables.forEach((value) => {
            documentInfo[value] = baseInfo[value];
        });
        const baseInputs = {
            [this.documentVariableName]: await this.documentPrompt.format({
                ...documentInfo,
            }),
        };
        const inputs = { [this.initialResponseName]: res, ...baseInputs };
        return inputs;
    }
    /** @ignore */
    async _call(values, runManager) {
        if (!(this.inputKey in values)) {
            throw new Error(`Document key ${this.inputKey} not found.`);
        }
        const { [this.inputKey]: docs, ...rest } = values;
        const currentDocs = docs;
        const initialInputs = await this._constructInitialInputs(currentDocs[0], rest);
        let res = await this.llmChain.predict({ ...initialInputs }, runManager?.getChild());
        const refineSteps = [res];
        for (let i = 1; i < currentDocs.length; i += 1) {
            const refineInputs = await this._constructRefineInputs(currentDocs[i], res);
            const inputs = { ...refineInputs, ...rest };
            res = await this.refineLLMChain.predict({ ...inputs }, runManager?.getChild());
            refineSteps.push(res);
        }
        return { [this.outputKey]: res };
    }
    _chainType() {
        return "refine_documents_chain";
    }
    static async deserialize(data) {
        const SerializedLLMChain = data.llm_chain;
        if (!SerializedLLMChain) {
            throw new Error("Missing llm_chain");
        }
        const SerializedRefineDocumentChain = data.refine_llm_chain;
        if (!SerializedRefineDocumentChain) {
            throw new Error("Missing refine_llm_chain");
        }
        return new RefineDocumentsChain({
            llmChain: await llm_chain_js_1.LLMChain.deserialize(SerializedLLMChain),
            refineLLMChain: await llm_chain_js_1.LLMChain.deserialize(SerializedRefineDocumentChain),
        });
    }
    serialize() {
        return {
            _type: this._chainType(),
            llm_chain: this.llmChain.serialize(),
            refine_llm_chain: this.refineLLMChain.serialize(),
        };
    }
}
exports.RefineDocumentsChain = RefineDocumentsChain;
