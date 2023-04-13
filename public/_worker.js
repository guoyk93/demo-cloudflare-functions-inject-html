const TITLE_START = "<title>"
const TITLE_END = "</title>"
const HEAD_END = "</head>"

async function responseForPostSEO(request, env, id) {
    const resp = await env.ASSETS.fetch(request);
    if (resp.status !== 200) {
        return resp;
    }

    let body = await resp.text();

    const [idxTitleStart, idxTitleEnd] = [body.indexOf(TITLE_START), body.indexOf(TITLE_END)];

    body = body.slice(0, idxTitleStart + TITLE_START.length) + "Hello Injected Title: " + id + body.slice(idxTitleEnd);

    const idxHeadEnd = body.indexOf(HEAD_END);

    body = body.slice(0, idxHeadEnd) + "<meta name=\"og:title\" content=\"Hello Injected Title: " + id + "\" />" + body.slice(idxHeadEnd);

    const newHeaders = {
        'content-lenght': body.length.toString()
    }

    resp.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "content-length") {
            newHeaders[key] = value;
        }
    })

    return new Response(body, {
        status: resp.status,
        headers: newHeaders,
    })
}

export default {
    async fetch(request, env) {
        const splits = (new URL(request.url)).pathname.split("/");

        // inject SEO meta tags for post pages
        if (splits.length === 3 && splits[0] === "" && splits[1] === "posts") {
            return responseForPostSEO(request, env, splits[2]);
        }

        return env.ASSETS.fetch(request);
    }
};