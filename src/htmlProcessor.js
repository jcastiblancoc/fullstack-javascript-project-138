import { JSDOM } from 'jsdom';
import { URL } from 'url';

export function extractLocalResources(html, baseUrl) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const base = new URL(baseUrl);
    const resources = [];

    document.querySelectorAll('link[rel="stylesheet"], script[src], img[src]').forEach((element) => {
        const attr = element.tagName === 'LINK' ? 'href' : 'src';
        const resourceUrl = element.getAttribute(attr);

        if (resourceUrl && resourceUrl.startsWith('/') || resourceUrl.startsWith(base.origin)) {
            const absoluteUrl = new URL(resourceUrl, base).href;
            resources.push(absoluteUrl);
        }
    });

    return resources;
}

export function updateHtmlLinks(html, resourcesMap) {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    document.querySelectorAll('link[rel="stylesheet"], script[src], img[src]').forEach((element) => {
        const attr = element.tagName === 'LINK' ? 'href' : 'src';
        const resourceUrl = element.getAttribute(attr);
        if (resourcesMap[resourceUrl]) {
            element.setAttribute(attr, resourcesMap[resourceUrl]);
        }
    });

    return dom.serialize();
}
