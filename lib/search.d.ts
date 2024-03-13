interface SearchParams {
    query: string;
}
interface SearchResult {
    url: string;
    text: string;
}
export declare function parseWebpage(/*title: string, snippet: string, */ pageUrl: string, onlySnippet?: boolean): Promise<SearchResult>;
export declare function search(params: SearchParams): Promise<[string, SearchResult[]]>;
export {};
