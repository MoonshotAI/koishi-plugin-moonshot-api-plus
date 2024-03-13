import axios from 'axios';
import * as url from 'url';

interface SearchParams {
    query: string;
    /*
    engine?: string;
    language?: string;
    maxPages?: number;
    useLocalWiki?: boolean;
    searchModel?: string;
    */
  }
  
  interface SearchResult {
    //title: string;
    url: string;
    //snippet: string;
    text: string;
  }

export async function parseWebpage(/*title: string, snippet: string, */pageUrl: string, onlySnippet: boolean = false): Promise<SearchResult> {
    if (onlySnippet) {
        return {/*title, */url: pageUrl, /*snippet, */text: ""};
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
            const response = await axios.post('https://url2text.msh.team/url-to-text-preview', {
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

        return {/*title, */url: pageUrl, /*snippet, */text: text};
    } catch (error) {
        console.error(`An error occurred: ${error}`);
        return {/*title, */url: pageUrl, /*snippet, */text: ""};
    }

    
}

export async function search(params: SearchParams): Promise<[string, SearchResult[]]> {
    console.log('Searching...');
    console.log('Key words: ', params.query);
  
    const startTime = new Date().getTime();
    const regexp = /(http|https):\/\/([\w-]+\.)+[\w-]+([\w.@?^=%&/~+#-]*[\w@?^=%&/~+#-])?/;
  
    let jsonList: SearchResult[] = [];
    let result: string = '';
  
    if (regexp.test(params.query)) {
      const paramList: any[] = [];
      let maxPages = 0;
  
      for (const url of params.query.match(regexp)) {
        console.log(url);
        //const data = { url, useLocalWiki: params.useLocalWiki, searchModel: params.searchModel };
        //paramList.push(data);
        let data = await parseWebpage(url);
        //console.log(data)
        jsonList.push(data);
        maxPages++;
      };
  
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
