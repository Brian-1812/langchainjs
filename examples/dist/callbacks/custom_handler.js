import { BaseCallbackHandler } from "langchain/callbacks";
export class MyCallbackHandler extends BaseCallbackHandler {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "MyCallbackHandler"
        });
    }
    async handleChainStart(chain) {
        console.log(`Entering new ${chain.name} chain...`);
    }
    async handleChainEnd(_output) {
        console.log("Finished chain.");
    }
    async handleAgentAction(action) {
        console.log(action.log);
    }
    async handleToolEnd(output) {
        console.log(output);
    }
    async handleText(text) {
        console.log(text);
    }
    async handleAgentEnd(action) {
        console.log(action.log);
    }
}
//# sourceMappingURL=custom_handler.js.map