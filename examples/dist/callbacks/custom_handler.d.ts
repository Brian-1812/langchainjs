import { BaseCallbackHandler } from "langchain/callbacks";
import { AgentAction, AgentFinish, ChainValues } from "langchain/schema";
export declare class MyCallbackHandler extends BaseCallbackHandler {
    name: string;
    handleChainStart(chain: {
        name: string;
    }): Promise<void>;
    handleChainEnd(_output: ChainValues): Promise<void>;
    handleAgentAction(action: AgentAction): Promise<void>;
    handleToolEnd(output: string): Promise<void>;
    handleText(text: string): Promise<void>;
    handleAgentEnd(action: AgentFinish): Promise<void>;
}
