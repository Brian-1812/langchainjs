import { PromptTemplate } from "langchain/prompts";
import { BaseChain } from "langchain/chains";
export class MyCustomChain extends BaseChain {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "llm", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "promptTemplate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "prompt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.llm = fields.llm;
        this.promptTemplate = fields.promptTemplate;
        this.prompt = PromptTemplate.fromTemplate(this.promptTemplate);
    }
    async _call(values, runManager) {
        // Your custom chain logic goes here
        // This is just an example that mimics LLMChain
        const promptValue = await this.prompt.formatPromptValue(values);
        // Whenever you call a language model, or another chain, you should pass
        // a callback manager to it. This allows the inner run to be tracked by
        // any callbacks that are registered on the outer run.
        // You can always obtain a callback manager for this by calling
        // `runManager?.getChild()` as shown below.
        const result = await this.llm.generatePrompt([promptValue], runManager?.getChild());
        // If you want to log something about this run, you can do so by calling
        // methods on the runManager, as shown below. This will trigger any
        // callbacks that are registered for that event.
        runManager?.handleText("Log something about this run");
        return { output: result.generations[0][0].text };
    }
    _chainType() {
        return "my_custom_chain";
    }
    get inputKeys() {
        return ["input"];
    }
    get outputKeys() {
        return ["output"];
    }
}
//# sourceMappingURL=advanced_subclass_call.js.map