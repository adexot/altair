import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface RenderOptions {
    endpointURL?: string;
    subscriptionsEndpoint?: string;
    initialQuery?: string;
    initialVariables?: string;
}

export const renderAltair = ({ endpointURL, subscriptionsEndpoint, initialQuery, initialVariables }: RenderOptions = {}) => {
    const altairHtml = readFileSync(resolve(__dirname, 'dist/index.html'), 'utf8');

    let renderedOptions = '';

    if (endpointURL) {
        renderedOptions += `window.__ALTAIR_ENDPOINT_URL__ = '${endpointURL}';`;
    }
    if (subscriptionsEndpoint) {
        renderedOptions += `window.__ALTAIR_SUBSCRIPTIONS_ENDPOINT__ = '${subscriptionsEndpoint}';`;
    }
    if (initialQuery) {
        renderedOptions += `window.__ALTAIR_INITIAL_QUERY__ = '${initialQuery}';`;
    }

    if (initialVariables) {
        renderedOptions += `window.__ALTAIR_INITIAL_VARIABLES__ = '${initialVariables}';`;
    }

    const renderedOptionsInScript = `<script>${renderedOptions}</script>`;
    return altairHtml.replace('<body>', `<body>${renderedOptionsInScript}`);
};

export const getDistDirectory = () => resolve(__dirname, 'dist');

export default renderAltair;
