/**
 * @highlight 22-22
 */

import { createRouter } from 'react-router-min'
import Home from './Home.js'
import NodeModules from './NodeModules.js'
import Module from './Module.js'

// routes can be a `Array` or `{path: Component}`
const routes = [
    { path: '/', name: 'Home', Component: Home },
    { path: '/node_modules', name: 'node_modules', Component: NodeModules },
    { path: '/node_modules/[...modulePath]', name: 'ModuleInfo', Component: Module },
]

// create a RouterMin instance, use Main Component to routing.
const { useRouter, Link, Main, routerList } = createRouter({
    routes,
    config: {
        base: '/12', // base affects the actual path name
        type: 'hash', // hash represents using `virtual pathname`
        cleanUrl: true, // remove extension name, default true.
        stripIndex: false, // Whether to strip "index" from the URL path. Defaults to `true`.
    },
})

// see log: Internally, the router type will not be perceived.
console.table('routerList', routerList)

export { useRouter, Link, routerList, Main as default }
