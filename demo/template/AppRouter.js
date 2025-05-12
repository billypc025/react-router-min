/**
 * @highlight 17+4
 */

import { createRouter } from 'react-router-min'
import Home from './Home.js'
import NodeModules from './NodeModules.js'
import Module from './Module.js'

// routes can be a Array or {path: Component}
const routes = [
    { path: '/', name: 'Home', Component: Home },
    { path: '/node_modules', name: 'Node_Modules', Component: NodeModules },
    { path: '/node_modules/[...modulePath]', name: 'ModuleInfo', Component: Module },
]

// create a RouterMin instance
const { useRouter, Link, Main, Router, pushUrl, replaceUrl, routerList } = createRouter({
    routes,
    config: { base: '{demoId}', type: 'history', cleanUrl: true, stripIndex: false },
})

export { useRouter, Link, Router, pushUrl, replaceUrl, routerList, Main as default }
