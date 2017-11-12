import { extname } from 'path';
import { readFile, readFileSync } from 'fs';
import React from 'react';
import { StaticRouter, withRouter, matchPath } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import { create } from 'axios';
import jwt from 'jsonwebtoken';
import { JSDOM } from 'jsdom';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import format from 'string-template';
import { compose, flatten, identity } from 'ramda';
import App, { Layout } from '../js/index';
import routes from '../js/routes';
import reducers from '../js/reducers';
import * as Index from '../js/index';
import * as Home from '../js/containers/home/index';
import * as About from '../js/containers/about/index';

/**
 * @constant options
 * @type {Object}
 */
const options = compose(
    JSON.parse,
    readFileSync
)('package.json');

/**
 * @method isAuthenticated
 * @param {Object} cookies
 * @return {Boolean}
 */
function isAuthenticated(cookies) {

    try {
        return Boolean(jwt.verify(cookies.jwttoken, process.env.CARPETBASE_SECRET));
    } catch (err) {
        return false;
    }

}

/**
 * @method compile
 * @param {Object} request
 * @param {Object} response
 * @return {Object}
 */
async function compile(request, response) {

    const { url, headers, cookies } = request;
    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
    const store = createStoreWithMiddleware(reducers);
    const LayoutWithRouter = withRouter(Index.Layout);
    const instance = create({
        baseURL: `http://${headers.host}/api/`,
        timeout: 1000,
        headers: request.headers
    });
    const params = { dispatch: store.dispatch, instance, response };

    try {

        // Await the population of the Redux store before rendering the application tree.
        Index.fetchData && await Index.fetchData(params);

        const assets = await Promise.all(routes.map(async route => {

            const match = matchPath(url, route);
            const { component } = route;

            if (match) {

                // Determine if the user is authenticated, and if not redirect to the login page.
                component && component.requiresAuth === true && !isAuthenticated(cookies) && response.redirect('/admin/login.html');
            
                // Fetch any data the current container requires to function.
                component && component.fetchData && await component.fetchData(params);

                // Yield any assets that the component wants to load.
                return component.assets || null;
            
            }

            return null;

        }));

        const html = renderToString((
            <Provider store={store}>
                <StaticRouter context={{}} location={url}>
                    <LayoutWithRouter />
                </StaticRouter>
            </Provider>
        ));
    
        return { html, state: store.getState(), assets: flatten(assets.filter(identity)) };

    } catch (err) {

        console.log('Error: ', err);

        const html = renderToString(
            <section className="error">
                We're currently experiencing difficulties. Please <a href="/">try again</a> later.
            </section>
        );

        return { html, state: store.getState(), assets: [] };

    }

}

/**
 * @method insertJS
 * @param {Object} jsDom 
 * @param {String} asset
 * @return {Object} 
 */
function insertJS(jsDom, asset) {

    const script = jsDom.window.document.createElement('script');
    script.setAttribute('charset', 'UTF-8');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('async', true);
    script.setAttribute('defer', true);
    script.setAttribute('src', `${asset}?version=${options.version}`);

    jsDom.window.document.head.appendChild(script);

    return jsDom;

}

export default function(request, response) {

    return readFile('public/index.html', 'utf8', async (_, document) => {

        // Render the application to string, and parse the template HTML file.
        const { html, state, assets } = await compile(request, response);
        const dom = format(document, { ...options, html });
        
        // Append the data taken from the Redux store and append it to the <body /> tag.
        const jsDom = new JSDOM(dom);
        // const script = jsDom.window.document.createElement('script');
        // script.setAttribute('type', 'text/javascript');
        // script.setAttribute('charset', 'UTF-8');
        // script.innerHTML = `window.__state__ = '${JSON.stringify(state)}';`;
        // jsDom.window.document.body.appendChild(script);

        // Insert any additional assets into the DOM.
        assets.forEach(asset => {

            switch (extname(asset)) {
                case '.js': insertJS(jsDom, asset); break;
                // case '.css': insertCSS(jsDom, asset); break;
            }

        });

        return !response.headersSent && response.send(jsDom.serialize());

    });

}
