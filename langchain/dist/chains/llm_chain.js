import { BaseChain } from "./base.js";
import { BasePromptTemplate } from "../prompts/base.js";
import { BaseLanguageModel } from "../base_language/index.js";
/**
 * Chain to run queries against LLMs.
 *
 * @example
 * ```ts
 * import { LLMChain } from "langchain/chains";
 * import { OpenAI } from "langchain/llms/openai";
 * import { PromptTemplate } from "langchain/prompts";
 *
 * const prompt = PromptTemplate.fromTemplate("Tell me a {adjective} joke");
 * const llm = new LLMChain({ llm: new OpenAI(), prompt });
 * ```
 */
export class LLMChain extends BaseChain {
    get inputKeys() {
        return this.prompt.inputVariables;
    }
    get outputKeys() {
        return [this.outputKey];
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "prompt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "llm", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "outputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "text"
        });
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.prompt = fields.prompt;
        this.llm = fields.llm;
        this.outputKey = fields.outputKey ?? this.outputKey;
        this.outputParser = fields.outputParser ?? this.outputParser;
        if (this.prompt.outputParser) {
            if (this.outputParser) {
                throw new Error("Cannot set both outputParser and prompt.outputParser");
            }
            this.outputParser = this.prompt.outputParser;
        }
    }
    /** @ignore */
    async _getFinalOutput(generations, promptValue, runManager) {
        const completion = generations[0].text;
        let finalCompletion;
        if (this.outputParser) {
            finalCompletion = await this.outputParser.parseWithPrompt(completion, promptValue, runManager?.getChild());
        }
        else {
            finalCompletion = completion;
        }
        return finalCompletion;
    }
    /** @ignore */
    async _call(values, runManager) {
        let stop;
        if ("stop" in values && Array.isArray(values.stop)) {
            stop = values.stop;
        }
        const promptValue = await this.prompt.formatPromptValue(values);
        const { generations } = await this.llm.generatePrompt([promptValue], stop, runManager?.getChild());
        return {
            [this.outputKey]: await this._getFinalOutput(generations[0], promptValue, runManager),
        };
    }
    /**
     * Format prompt with values and pass to LLM
     *
     * @param values - keys to pass to prompt template
     * @param callbackManager - CallbackManager to use
     * @returns Completion from LLM.
     *
     * @example
     * ```ts
     * llm.predict({ adjective: "funny" })
     * ```
     */
    async predict(values, callbackManager) {
        const output = await this.call(values, callbackManager);
        return output[this.outputKey];
    }
    _chainType() {
        return "llm_chain";
    }
    static async deserialize(data) {
        const { llm, prompt } = data;
        if (!llm) {
            throw new Error("LLMChain must have llm");
        }
        if (!prompt) {
            throw new Error("LLMChain must have prompt");
        }
        return new LLMChain({
            llm: await BaseLanguageModel.deserialize(llm),
            prompt: await BasePromptTemplate.deserialize(prompt),
        });
    }
    serialize() {
        return {
            _type: this._chainType(),
            llm: this.llm.serialize(),
            prompt: this.prompt.serialize(),
        };
    }
}
