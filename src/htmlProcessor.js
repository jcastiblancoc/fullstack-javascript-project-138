export function extractLocalResources(html, baseUrl) {
    const resourceUrls = [];
    const regex = /<(?:img|script|link)\s+(?:[^>]*?)(?:src|href)="([^"]+)"/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
        const url = match[1];
        if (!url.startsWith('http')) {
            // Convierte URL relativa a absoluta
            const absoluteUrl = new URL(url, baseUrl).href;
            resourceUrls.push(absoluteUrl);
        }
    }

    return resourceUrls;
}

export function updateHtmlLinks(html, resourcesMap) {
    return html.replace(/(src|href)="([^"]+)"/g, (match, attr, url) => {
        // Convertir URLs relativas en absolutas
        const absoluteUrl = new URL(url, 'https://codica.la').href;

        if (resourcesMap[absoluteUrl]) {
            return `${attr}="${resourcesMap[absoluteUrl]}"`; // Reemplaza con el path local
        }
        return match; // Mantiene URLs externas sin cambios
    });
}

