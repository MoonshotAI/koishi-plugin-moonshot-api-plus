"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.parseWebpage = void 0;
const axios_1 = __importDefault(require("axios"));
async function parseWebpage(/*title: string, snippet: string, */ pageUrl, onlySnippet = false) {
    if (onlySnippet) {
        return { /*title, */ url: pageUrl, /*snippet, */ text: "" };
    }
    let text = "";
    try {
        /*
        if (useLocalWiki) {
            const parsedUrl = url.parse(pageUrl);
            if (parsedUrl.hostname === 'zh.wikipedia.org' || parsedUrl.hostname === 'en.wikipedia.org') {
                // Assuming 'searchWikipedia' is a function that you have to implement to fetch data from Wikipedia
                const wikiTitle = decodeURIComponent(parsedUrl.pathname.split('/').pop());
                text = await searchWikipedia(wikiTitle, parsedUrl.hostname.includes('zh.') ? 'zh' : 'en');
            }
        }
        */
        if (text === "") {
            const response = await axios_1.default.post('https://url2text.msh.team/url-to-text-preview', {
                url: pageUrl,
                preview_type: 'text'
            }, {
                headers: {
                    'User-Agent': 'apifox/1.0.0 (https://www.apifox.cn)',
                    'Content-Type': 'application/json'
                }
            });
            text = response.data;
        }
        return { /*title, */ url: pageUrl, /*snippet, */ text: text };
    }
    catch (error) {
        console.error(`An error occurred: ${error}`);
        return { /*title, */ url: pageUrl, /*snippet, */ text: "" };
    }
}
exports.parseWebpage = parseWebpage;
async function search(params) {
    console.log('Searching...');
    console.log('Key words: ', params.query);
    const startTime = new Date().getTime();
    const regexp = /(http|https):\/\/([\w-]+\.)+[\w-]+([\w.@?^=%&/~+#-]*[\w@?^=%&/~+#-])?/;
    let jsonList = [];
    let result = '';
    if (regexp.test(params.query)) {
        const paramList = [];
        let maxPages = 0;
        for (const url of params.query.match(regexp)) {
            console.log(url);
            //const data = { url, useLocalWiki: params.useLocalWiki, searchModel: params.searchModel };
            //paramList.push(data);
            let data = await parseWebpage(url);
            //console.log(data)
            jsonList.push(data);
            maxPages++;
        }
        ;
        //await multiThreadingRunning(parseWebpage, paramList, jsonList);
        if (jsonList !== null) {
            jsonList.forEach((res, index) => {
                result += (index + 1) + ':' + JSON.stringify(res).slice(0, 20000);
            });
        }
        /*
      } else {
        // Implement callSogou and searchSerp according to your logic
        if (params.engine === 'sogou') {
          [result, jsonList] = await callSogou(params.query);
        } else {
          const response = await searchSerp(params.query, params.engine, params.language);
          [result, jsonList] = processSearchResult(response, params.query, params.maxPages, params.useLocalWiki, params.searchModel);
        }
      }
      */
        const endTime = new Date().getTime();
        console.log(`Search time: ${endTime - startTime}`);
    }
    return [result, jsonList];
}
exports.search = search;
