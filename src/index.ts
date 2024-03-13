import { h, Context, Schema, Session } from 'koishi'
import OpenAI from 'openai';
import { } from 'koishi-plugin-puppeteer'
import { basicPrompt, gamePrompt } from './prompt'
import { config } from './config'
import { sendChatCompletionsRequest } from './openai'
import { useHistory, setHistory, kimiuseHistory, kimisetHistory } from './context';
import { sendStableDiffusionRequest } from './image';
import { search } from './search'

export const name = 'openai-chatgpt'
//export const inject = ['database']

export const Config: Schema<config> = Schema.object({
  apiKey: Schema.string().required().description("Moonshot API Key: https://platform.moonshot.cn/console/api-keys"),
  apiAddress: Schema.string().default("https://api.moonshot.cn/v1").description("API 请求地址。"),
  triggerWordChat: Schema.string().default("chat").description("触发机器人回答的关键词。"),
  triggerWordGame: Schema.string().default("game").description("触发机器人游戏模式的关键词。"),
  model: Schema.union(['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k']).default('moonshot-v1-8k'),
  temperature: Schema.number().default(1).description("温度，更高的值意味着模型将承担更多的风险。对于更有创造性的应用，可以尝试 0.9，而对于有明确答案的应用，可以尝试 0（argmax 采样）。"),
  maxTokens: Schema.number().default(1024).description("生成的最大令牌数。"),
  topP: Schema.number().default(1),
  frequencyPenalty: Schema.number().default(0).description('数值在 -2.0 和 2.0 之间。正值是根据到目前为止它们在文本中的现有频率来惩罚新的标记，减少模型逐字逐句地重复同一行的可能性。'),
  presencePenalty: Schema.number().default(0).description('数值在 -2.0 和 2.0 之间。正值根据新标记在文本中的现有频率对其进行惩罚，减少了模型（model）逐字重复同一行的可能性。'),
  stop: Schema.array(Schema.string()).default([]).description('生成的文本将在遇到任何一个停止标记时停止。'),
  errorMessage: Schema.string().default("回答出错了，请联系管理员。").description("回答出错时的提示信息。"),
  stableDiffusionMode: Schema.boolean().default(true).description("开启 SD 生成图片模式。"),
  stableDiffusionAPI: Schema.string().description("用于图片模式的 Stable Diffusion WebUI 请求地址。")
})

async function addImageToContent(textContent: string, ctx: Context, config: config) {
  console.log("sending");
  if(!config.stableDiffusionMode) return h('message', textContent);
  const promptIndex = textContent.indexOf("<场景图片>") + 7;
  const prompt = textContent.slice(promptIndex);
  const stableDiffusionResponse = await sendStableDiffusionRequest(ctx, config.stableDiffusionAPI, {prompt: prompt, steps: 25});
  return h('message', textContent.slice(0, promptIndex), h.image('data:image/png;base64,' + stableDiffusionResponse.data.images[0]));
}

export async function apply(ctx: Context, config: config) {

  const openai = new OpenAI({
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

    if(message == 'clear') {
      try {
        setHistory(userId, []);
        return '聊天历史清除成功';
      } catch (error) {
        console.log(error);
        return '清除失败';
      }
    }

    let q = kimiuseHistory(userId);
    if(q == null) q.push(basicPrompt);
    const referenceList = await search({query: message})
    if(referenceList[0] != '') q.push({ 'role': 'system', "content": referenceList[0] })
    q.push({ 'role': 'user', 'content': message })
    //console.log(q);
    session.send("查询中，请耐心等待...");
    const response = await sendChatCompletionsRequest(q, config, openai);
    q.push(response.choices[0].message);
    kimisetHistory(userId, q);
    return response.choices[0].message.content;
      //return response.content;
  })
  ctx.command(config.triggerWordGame + ' <message:text>').option('start', '-s').action(async ({ options, session }, message) => {
    let userId = session.userId;

    if(options?.start) {
      session.send("开始游戏中，请耐心等待...");
      const response = await sendChatCompletionsRequest([gamePrompt], config, openai);
      setHistory(userId, [gamePrompt, response.choices[0].message]);
      return await addImageToContent(response.choices[0].message.content, ctx, config);
    }
    
    let contextList = useHistory(userId)
    if(contextList != null) {
      session.send("获取中，请耐心等待...")
      contextList.push({ 'role': 'user', 'content': message });
      const response = await sendChatCompletionsRequest(contextList, config, openai);
      contextList.push (response.choices[0].message);
      setHistory(userId, contextList);
      return await addImageToContent(response.choices[0].message.content, ctx, config);
    } else {
      return "未检索到游戏历史记录，您还从未开始游戏，请使用" + config.triggerWordGame + " --start 选项开始游戏";
    }
  })
}