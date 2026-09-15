import z from "zod";
let apiKey = "";
export const setTavilyApiKey = (value) => {
    apiKey = value;
};
const webSearch = async (query) => {
    const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, max_results: 5 }),
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
    const response = await fetch("https://api.tavily.com/extract", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls: [url] }),
    }).then((res) => res.text());
    try {
        const { results } = z
            .object({
            results: z.array(z.object({
                raw_content: z.coerce.string(),
            })),
        })
            .parse(JSON.parse(response));
        return {
            title: "",
            content: results[0].raw_content,
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
