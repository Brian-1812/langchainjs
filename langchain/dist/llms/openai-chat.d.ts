import { ChatCompletionRequestMessage, CreateChatCompletionRequest, ConfigurationParameters, CreateChatCompletionResponse } from "openai";
import type { AxiosRequestConfig } from "axios";
import type { StreamingAxiosConfiguration } from "../util/axios-types.js";
import { BaseLLMCallOptions, BaseLLMParams, LLM } from "./base.js";
import { CallbackManagerForLLMRun } from "../callbacks/manager.js";
/**
 * Input to OpenAI class.
 */
export interface OpenAIChatInput {
    /** Sampling temperature to use, between 0 and 2, defaults to 1 */
    temperature: number;
    /** Total probability mass of tokens to consider at each step, between 0 and 1, defaults to 1 */
    topP: number;
    /** Penalizes repeated tokens according to frequency */
    frequencyPenalty: number;
    /** Penalizes repeated tokens */
    presencePenalty: number;
    /** Number of chat completions to generate for each prompt */
    n: number;
    /** Dictionary used to adjust the probability of specific tokens being generated */
    logitBias?: Record<string, number>;
    /** Whether to stream the results or not */
    streaming: boolean;
    /** Model name to use */
    modelName: string;
    /** ChatGPT messages to pass as a prefix to the prompt */
    prefixMessages?: ChatCompletionRequestMessage[];
    /** Holds any additional parameters that are valid to pass to {@link
     * https://platform.openai.com/docs/api-reference/completions/create |
     * `openai.create`} that are not explicitly specified on this class.
     */
    modelKwargs?: Kwargs;
    /** List of stop words to use when generating */
    stop?: string[];
    /**
     * Timeout to use when making requests to OpenAI.
     */
    timeout?: number;
    /**
     * Maximum number of tokens to generate in the completion.  If not specified,
     * defaults to the maximum number of tokens allowed by the model.
     */
    maxTokens?: number;
}
export interface OpenAIChatCallOptions extends BaseLLMCallOptions {
    /**
     * List of stop words to use when generating
     */
    stop?: string[];
    /**
     * Additional options to pass to the underlying axios request.
     */
    options?: AxiosRequestConfig;
}
type Kwargs = Record<string, any>;
/**
 * Wrapper around OpenAI large language models that use the Chat endpoint.
 *
 * To use you should have the `openai` package installed, with the
 * `OPENAI_API_KEY` environment variable set.
 *
 * @remarks
 * Any parameters that are valid to be passed to {@link
 * https://platform.openai.com/docs/api-reference/chat/create |
 * `openai.createCompletion`} can be passed through {@link modelKwargs}, even
 * if not explicitly available on this class.
 */
export declare class OpenAIChat extends LLM implements OpenAIChatInput {
    CallOptions: OpenAIChatCallOptions;
    temperature: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    n: number;
    logitBias?: Record<string, number>;
    maxTokens?: number;
    modelName: string;
    prefixMessages?: ChatCompletionRequestMessage[];
    modelKwargs?: Kwargs;
    timeout?: number;
    stop?: string[];
    streaming: boolean;
    private client;
    private clientConfig;
    constructor(fields?: Partial<OpenAIChatInput> & BaseLLMParams & {
        openAIApiKey?: string;
    }, configuration?: ConfigurationParameters);
    /**
     * Get the parameters used to invoke the model
     */
    invocationParams(): Omit<CreateChatCompletionRequest, "messages"> & Kwargs;
    /** @ignore */
    _identifyingParams(): {
        apiKey?: string | Promise<string> | ((name: string) => string) | ((name: string) => Promise<string>) | undefined;
        organization?: string | undefined;
        username?: string | undefined;
        password?: string | undefined;
        accessToken?: string | Promise<string> | ((name?: string | undefined, scopes?: string[] | undefined) => string) | ((name?: string | undefined, scopes?: string[] | undefined) => Promise<string>) | undefined;
        basePath?: string | undefined;
        baseOptions?: any;
        formDataCtor?: (new () => any) | undefined;
        stop?: import("openai").CreateChatCompletionRequestStop | undefined;
        stream?: boolean | null | undefined;
        user?: string | undefined;
        model: string;
        temperature?: number | null | undefined;
        top_p?: number | null | undefined;
        n?: number | null | undefined;
        max_tokens?: number | undefined;
        presence_penalty?: number | null | undefined;
        frequency_penalty?: number | null | undefined;
        logit_bias?: object | null | undefined;
        model_name: string;
    };
    /**
     * Get the identifying parameters for the model
     */
    identifyingParams(): {
        apiKey?: string | Promise<string> | ((name: string) => string) | ((name: string) => Promise<string>) | undefined;
        organization?: string | undefined;
        username?: string | undefined;
        password?: string | undefined;
        accessToken?: string | Promise<string> | ((name?: string | undefined, scopes?: string[] | undefined) => string) | ((name?: string | undefined, scopes?: string[] | undefined) => Promise<string>) | undefined;
        basePath?: string | undefined;
        baseOptions?: any;
        formDataCtor?: (new () => any) | undefined;
        stop?: import("openai").CreateChatCompletionRequestStop | undefined;
        stream?: boolean | null | undefined;
        user?: string | undefined;
        model: string;
        temperature?: number | null | undefined;
        top_p?: number | null | undefined;
        n?: number | null | undefined;
        max_tokens?: number | undefined;
        presence_penalty?: number | null | undefined;
        frequency_penalty?: number | null | undefined;
        logit_bias?: object | null | undefined;
        model_name: string;
    };
    private formatMessages;
    /** @ignore */
    _call(prompt: string, stopOrOptions?: string[] | this["CallOptions"], runManager?: CallbackManagerForLLMRun): Promise<string>;
    /** @ignore */
    completionWithRetry(request: CreateChatCompletionRequest, options?: StreamingAxiosConfiguration): Promise<CreateChatCompletionResponse>;
    _llmType(): string;
}
export {};
