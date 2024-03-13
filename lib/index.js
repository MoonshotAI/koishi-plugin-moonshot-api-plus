"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.Config = exports.name = void 0;
const koishi_1 = require("koishi");
const openai_1 = __importDefault(require("openai"));
const prompt_1 = require("./prompt");
const openai_2 = require("./openai");
const context_1 = require("./context");
const image_1 = require("./image");
const search_1 = require("./search");
exports.name = 'openai-chatgpt';
//export const inject = ['database']
exports.Config = koishi_1.Schema.object({
    apiKey: koishi_1.Schema.string().required().description("Moonshot API Key: https://platform.moonshot.cn/console/api-keys"),
    apiAddress: koishi_1.Schema.string().default("https://api.moonshot.cn/v1").description("API 请求地址。"),
    triggerWordChat: koishi_1.Schema.string().default("chat").description("触发机器人回答的关键词。"),
    triggerWordGame: koishi_1.Schema.string().default("game").description("触发机器人游戏模式的关键词。"),
    model: koishi_1.Schema.union(['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k']).default('moonshot-v1-8k'),
    temperature: koishi_1.Schema.number().default(1).description("温度，更高的值意味着模型将承担更多的风险。对于更有创造性的应用，可以尝试 0.9，而对于有明确答案的应用，可以尝试 0（argmax 采样）。"),
    maxTokens: koishi_1.Schema.number().default(100).description("生成的最大令牌数。"),
    topP: koishi_1.Schema.number().default(1),
    frequencyPenalty: koishi_1.Schema.number().default(0).description('数值在 -2.0 和 2.0 之间。正值是根据到目前为止它们在文本中的现有频率来惩罚新的标记，减少模型逐字逐句地重复同一行的可能性。'),
    presencePenalty: koishi_1.Schema.number().default(0).description('数值在 -2.0 和 2.0 之间。正值根据新标记在文本中的现有频率对其进行惩罚，减少了模型（model）逐字重复同一行的可能性。'),
    stop: koishi_1.Schema.array(koishi_1.Schema.string()).default([]).description('生成的文本将在遇到任何一个停止标记时停止。'),
    errorMessage: koishi_1.Schema.string().default("回答出错了，请联系管理员。").description("回答出错时的提示信息。"),
    stableDiffusionMode: koishi_1.Schema.boolean().default(true).description("开启SD生成图片模式。"),
    stableDiffusionAPI: koishi_1.Schema.string().description("用于图片模式的 Stable Diffusion WebUI 请求地址。")
});
async function addImageToContent(textContent, ctx, config) {
    console.log("sending");
    if (!config.stableDiffusionMode)
        return (0, koishi_1.h)('message', textContent);
    const promptIndex = textContent.indexOf("<场景图片>") + 7;
    const prompt = textContent.slice(promptIndex);
    const stableDiffusionResponse = await (0, image_1.sendStableDiffusionRequest)(ctx, config.stableDiffusionAPI, { prompt: prompt, steps: 25 });
    return (0, koishi_1.h)('message', textContent.slice(0, promptIndex), koishi_1.h.image('data:image/png;base64,' + stableDiffusionResponse.data.images[0]));
}
async function apply(ctx, config) {
    const openai = new openai_1.default({
        apiKey: config.apiKey,
        baseURL: config.apiAddress,
    });
    /*
      ctx.before('send', async (session) => {
        if (config.pictureMode === true) {
          const html = `
          <html>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/css/tabler.min.css">
          <style> body { background-color: white; } </style>
          <div class="toast show" id="message">
            <div class="toast-header">
              <span class="avatar avatar-xs me-2" style="background-image: url(https://pic.sky390.cn/pics/2023/03/09/6409690ebc4df.png)"></span>
              <strong class="me-auto">ChatGPT</strong>
            </div>
            <div class="toast-body">
              ${ session.content.replace(/\n/g, '<br>').replace(/<\/*template>/g, '') }
            </div>
          </div>
          <script>
            const message = document.getElementById('message');
            document.getElementsByTagName('html')[0].style.height = message.offsetHeight;
            document.getElementsByTagName('html')[0].style.width = message.offsetWidth;
          </script>
          </html>`;
          session.content = await ctx.puppeteer.render(html);
        }
      })
      */
    ctx.command(config.triggerWordChat + ' <message:text>').action(async ({ session }, message) => {
        let userId = session.userId;
        if (message == 'clear') {
            try {
                (0, context_1.setHistory)(userId, []);
                return '聊天历史清除成功';
            }
            catch (error) {
                console.log(error);
                return '清除失败';
            }
        }
        let q = (0, context_1.kimiuseHistory)(userId);
        if (q == null)
            q.push(prompt_1.basicPrompt);
        const referenceList = await (0, search_1.search)({ query: message });
        if (referenceList[0] != '')
            q.push({ 'role': 'system', "content": referenceList[0] });
        q.push({ 'role': 'user', 'content': message });
        //console.log(q);
        session.send("查询中，请耐心等待...");
        const response = await (0, openai_2.sendChatCompletionsRequest)(q, config, openai);
        q.push(response.choices[0].message);
        (0, context_1.kimisetHistory)(userId, q);
        return response.choices[0].message.content;
        //return response.content;
    });
    ctx.command(config.triggerWordGame + ' <message:text>').option('start', '-s').action(async ({ options, session }, message) => {
        let userId = session.userId;
        if (options?.start) {
            session.send("开始游戏中，请耐心等待...");
            const response = await (0, openai_2.sendChatCompletionsRequest)([prompt_1.gamePrompt], config, openai);
            (0, context_1.setHistory)(userId, [prompt_1.gamePrompt, response.choices[0].message]);
            return await addImageToContent(response.choices[0].message.content, ctx, config);
        }
        let contextList = (0, context_1.useHistory)(userId);
        if (contextList != null) {
            session.send("获取中，请耐心等待...");
            contextList.push({ 'role': 'user', 'content': message });
            const response = await (0, openai_2.sendChatCompletionsRequest)(contextList, config, openai);
            contextList.push(response.choices[0].message);
            (0, context_1.setHistory)(userId, contextList);
            return await addImageToContent(response.choices[0].message.content, ctx, config);
        }
        else {
            return "未检索到游戏历史记录，您还从未开始游戏，请使用" + config.triggerWordGame + " --start 选项开始游戏";
        }
    });
}
exports.apply = apply;
