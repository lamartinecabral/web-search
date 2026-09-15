import z from "zod";
let apiKey = "";
export const setOllamaApiKey = (value) => {
    apiKey = value;
};
const webSearch = async (query) => {
    const response = await fetch("https://ollama.com/api/web_search", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, maxResults: 5 }),
    }).then((res) => res.text());
    try {
        const { results } = z
            .object({
            results: z.array(z.object({
                title: z.coerce.string(),
                url: z.coerce.string(),
                content: z.coerce.string(),
            })),
        })
            .parse(JSON.parse(response));
        return results.map((res) => ({
            title: res.title,
            url: res.url,
            snippet: res.content,
        }));
    }
    catch (_) {
        throw new Error("Web search failed");
    }
};
const webFetch = async (url) => {
    const response = await fetch("https://ollama.com/api/web_fetch", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
    }).then((res) => res.text());
    try {
        const result = z
            .object({
            title: z.coerce.string(),
            content: z.coerce.string(),
        })
            .parse(JSON.parse(response));
        return {
            title: result.title,
            content: result.content,
        };
    }
    catch (_) {
        throw new Error("Web fetch failed");
    }
};
export default {
    webFetch,
    webSearch,
};
