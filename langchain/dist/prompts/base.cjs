"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseExampleSelector = exports.BaseStringPromptTemplate = exports.BasePromptTemplate = exports.StringPromptValue = void 0;
const index_js_1 = require("../schema/index.cjs");
class StringPromptValue {
    constructor(value) {
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.value = value;
    }
    toString() {
        return this.value;
    }
    toChatMessages() {
        return [new index_js_1.HumanChatMessage(this.value)];
    }
}
exports.StringPromptValue = StringPromptValue;
/**
 * Base class for prompt templates. Exposes a format method that returns a
 * string prompt given a set of input values.
 */
class BasePromptTemplate {
    constructor(input) {
        Object.defineProperty(this, "inputVariables", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "partialVariables", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const { inputVariables } = input;
        if (inputVariables.includes("stop")) {
            throw new Error("Cannot have an input variable named 'stop', as it is used internally, please rename.");
        }
        Object.assign(this, input);
    }
    async mergePartialAndUserVariables(userVariables) {
        const partialVariables = this.partialVariables ?? {};
        const partialValues = {};
        for (const [key, value] of Object.entries(partialVariables)) {
            if (typeof value === "string") {
                partialValues[key] = value;
            }
            else {
                partialValues[key] = await value();
            }
        }
        const allKwargs = { ...partialValues, ...userVariables };
        return allKwargs;
    }
    /**
     * Load a prompt template from a json-like object describing it.
     *
     * @remarks
     * Deserializing needs to be async because templates (e.g. {@link FewShotPromptTemplate}) can
     * reference remote resources that we read asynchronously with a web
     * request.
     */
    static async deserialize(data) {
        switch (data._type) {
            case "prompt": {
                const { PromptTemplate } = await import("./prompt.js");
                return PromptTemplate.deserialize(data);
            }
            case undefined: {
                const { PromptTemplate } = await import("./prompt.js");
                return PromptTemplate.deserialize({ ...data, _type: "prompt" });
            }
            case "few_shot": {
                const { FewShotPromptTemplate } = await import("./few_shot.js");
                return FewShotPromptTemplate.deserialize(data);
            }
            default:
                throw new Error(`Invalid prompt type in config: ${data._type}`);
        }
    }
}
exports.BasePromptTemplate = BasePromptTemplate;
class BaseStringPromptTemplate extends BasePromptTemplate {
    async formatPromptValue(values) {
        const formattedPrompt = await this.format(values);
        return new StringPromptValue(formattedPrompt);
    }
}
exports.BaseStringPromptTemplate = BaseStringPromptTemplate;
/**
 * Base class for example selectors.
 */
class BaseExampleSelector {
}
exports.BaseExampleSelector = BaseExampleSelector;
