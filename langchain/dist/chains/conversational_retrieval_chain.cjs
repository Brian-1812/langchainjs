"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationalRetrievalQAChain = void 0;
const prompt_js_1 = require("../prompts/prompt.cjs");
const base_js_1 = require("./base.cjs");
const llm_chain_js_1 = require("./llm_chain.cjs");
const load_js_1 = require("./question_answering/load.cjs");
const question_generator_template = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;
const qa_template = `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
Helpful Answer:`;
class ConversationalRetrievalQAChain extends base_js_1.BaseChain {
    get inputKeys() {
        return [this.inputKey, this.chatHistoryKey];
    }
    get outputKeys() {
        return this.combineDocumentsChain.outputKeys.concat(this.returnSourceDocuments ? ["sourceDocuments"] : []);
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "inputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "question"
        });
        Object.defineProperty(this, "chatHistoryKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "chat_history"
        });
        Object.defineProperty(this, "retriever", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "combineDocumentsChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "questionGeneratorChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "returnSourceDocuments", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.retriever = fields.retriever;
        this.combineDocumentsChain = fields.combineDocumentsChain;
        this.questionGeneratorChain = fields.questionGeneratorChain;
        this.inputKey = fields.inputKey ?? this.inputKey;
        this.returnSourceDocuments =
            fields.returnSourceDocuments ?? this.returnSourceDocuments;
    }
    /** @ignore */
    async _call(values, runManager) {
        if (!(this.inputKey in values)) {
            throw new Error(`Question key ${this.inputKey} not found.`);
        }
        if (!(this.chatHistoryKey in values)) {
            throw new Error(`chat history key ${this.inputKey} not found.`);
        }
        const question = values[this.inputKey];
        const chatHistory = values[this.chatHistoryKey];
        let newQuestion = question;
        if (chatHistory.length > 0) {
            const result = await this.questionGeneratorChain.call({
                question,
                chat_history: chatHistory,
            }, runManager?.getChild());
            const keys = Object.keys(result);
            if (keys.length === 1) {
                newQuestion = result[keys[0]];
            }
            else {
                throw new Error("Return from llm chain has multiple values, only single values supported.");
            }
        }
        const docs = await this.retriever.getRelevantDocuments(newQuestion);
        const inputs = {
            question: newQuestion,
            input_documents: docs,
            chat_history: chatHistory,
        };
        const result = await this.combineDocumentsChain.call(inputs, runManager?.getChild());
        if (this.returnSourceDocuments) {
            return {
                ...result,
                sourceDocuments: docs,
            };
        }
        return result;
    }
    _chainType() {
        return "conversational_retrieval_chain";
    }
    static async deserialize(_data, _values) {
        throw new Error("Not implemented.");
    }
    serialize() {
        throw new Error("Not implemented.");
    }
    static fromLLM(llm, retriever, options = {}) {
        const { questionGeneratorTemplate, qaTemplate, ...rest } = options;
        const question_generator_prompt = prompt_js_1.PromptTemplate.fromTemplate(questionGeneratorTemplate || question_generator_template);
        const qa_prompt = prompt_js_1.PromptTemplate.fromTemplate(qaTemplate || qa_template);
        const qaChain = (0, load_js_1.loadQAStuffChain)(llm, { prompt: qa_prompt });
        const questionGeneratorChain = new llm_chain_js_1.LLMChain({
            prompt: question_generator_prompt,
            llm,
        });
        const instance = new this({
            retriever,
            combineDocumentsChain: qaChain,
            questionGeneratorChain,
            ...rest,
        });
        return instance;
    }
}
exports.ConversationalRetrievalQAChain = ConversationalRetrievalQAChain;
