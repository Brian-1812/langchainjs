import { BasePromptTemplate } from "langchain/prompts";
import { BaseLanguageModel } from "langchain/base_language";
import { CallbackManagerForChainRun } from "langchain/callbacks";
import { BaseChain, ChainInputs } from "langchain/chains";
import { ChainValues } from "langchain/schema";
export interface MyCustomChainInputs extends ChainInputs {
    llm: BaseLanguageModel;
    promptTemplate: string;
}
export declare class MyCustomChain extends BaseChain implements MyCustomChainInputs {
    llm: BaseLanguageModel;
    promptTemplate: string;
    prompt: BasePromptTemplate;
    constructor(fields: MyCustomChainInputs);
    _call(values: ChainValues, runManager?: CallbackManagerForChainRun): Promise<ChainValues>;
    _chainType(): string;
    get inputKeys(): string[];
    get outputKeys(): string[];
}
