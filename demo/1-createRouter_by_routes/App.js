/**
 * @highlight 13-16 18-18 19-19 25+1
 */

import { createRouter } from 'react-router-min'
import Layout from './Layout.js'
import Home from './Home.js'
import About from './About.js'

// create a RouterMin instance, use Main Component to routing.
const { Main, routerList } = createRouter({
    // routes can be a `Array` or `{path: Component}`
    routes: [
        { path: '/', Component: Home }, // pathname: `/1/`
        { path: '/about', Component: About }, // pathname: `/1/about`
    ],
    config: {
        base: '/1', //base path, `http://localhost:8080/1`
        type: 'history', // support `'history'` & `'hash'`
        cleanUrl: true, // remove extension name, default `true`.
        stripIndex: false, // Whether to strip "index" from the URL path. Defaults to `true`.
    },
})

// log routerList
console.table('routerList', routerList)

export default function App() {
    return (
        <Main>
            <Layout />
        </Main>
    )
}
