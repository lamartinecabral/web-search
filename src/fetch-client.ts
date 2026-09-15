import { extractContent } from "@lamartinecabral/extract-content";
import { Window } from "happy-dom";
import type { FetchResult, SearchClient, SearchResult } from "./utils.js";
import { Mutex } from "./utils.js";

const DUCKDUCKGO_URL = "https://html.duckduckgo.com/html";

export async function isDuckduckgoAvailable() {
  let document: HtmlDocument | undefined;
  try {
    document = createDocument(DUCKDUCKGO_URL, "DuckDuckGo availability check");
    const source = await fetchText(
      DUCKDUCKGO_URL,
      "DuckDuckGo availability check",
    );
    document.write(source);
    const content = document.getElementById("content_homepage");
    return !!content;
  } catch {
    return false;
  } finally {
    closeDocument(document);
  }
}

const webSearch = async (query: string): Promise<SearchResult[]> => {
  const url = `${DUCKDUCKGO_URL}/?q=${encodeURIComponent(query)}`;
  let document: HtmlDocument | undefined;
  try {
    document = createDocument(url, "Web search");
    const source = await fetchText(url, "Web search");

    try {
      document.write(source);
    } catch (error) {
      throw withCause("Web search response parsing failed", error);
    }

    const resultElems = [...document.querySelectorAll(".web-result")];

    let results: SearchResult[];
    try {
      results = resultElems
        .map((elem) => {
          const title = innerText(elem.querySelector(".result__title"));
          let url = innerText(elem.querySelector(".result__url"));
          if (url && !url.startsWith("http")) url = `https://${url}`;
          const snippet = innerText(elem.querySelector(".result__snippet"));
          return { title, url, snippet };
        })
        .filter((res) => !!res.snippet);
    } catch (error) {
      throw withCause("Web search result parsing failed", error);
    }

    if (!results.length) {
      throw new Error("Web search returned no results");
    }

    return results;
  } finally {
    closeDocument(document);
  }
};

const webFetch = async (url: string): Promise<FetchResult> => {
  let document: HtmlDocument | undefined;
  try {
    document = createDocument(url, "Web fetch");
    const source = await fetchText(url, "Web fetch");

    try {
      document.write(source);
    } catch (error) {
      throw withCause("Web fetch response parsing failed", error);
    }

    let result: FetchResult;
    try {
      result = extractContent(document);
    } catch (error) {
      throw withCause("Web fetch content extraction failed", error);
    }

    return result;
  } finally {
    closeDocument(document);
  }
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const withCause = (message: string, cause: unknown) =>
  new Error(`${message}: ${errorMessage(cause)}`, { cause });

const responseError = (response: Response) => {
  const status = `${response.status} ${response.statusText}`.trim();
  return new Error(`HTTP request failed (${status})`);
};

type HtmlDocument = InstanceType<typeof Window>["document"];

const createDocument = (url: string, operation: string) => {
  try {
    return new Window({ url }).document;
  } catch (error) {
    throw withCause(`${operation} document initialization failed`, error);
  }
};

const closeDocument = (document: HtmlDocument | undefined) => {
  try {
    document?.close();
  } catch {
    // Cleanup must not hide the original request or parsing error.
  }
};

const fetchText = async (url: string, operation: string) => {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw withCause(`${operation} request failed`, error);
  }

  if (!response.ok) {
    throw withCause(`${operation} request failed`, responseError(response));
  }

  try {
    return await response.text();
  } catch (error) {
    throw withCause(`${operation} response could not be read`, error);
  }
};

const innerText = <T extends {}>(elem: T | null) => {
  return elem && "innerText" in elem ? String(elem.innerText).trim() : "";
};

const mutex = new Mutex();

const client: SearchClient = {
  webFetch: (url: string) => mutex.runExclusive(() => webFetch(url)),
  webSearch: (query: string) => mutex.runExclusive(() => webSearch(query)),
};

export default client;
