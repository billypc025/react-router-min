/**
 * @highlight 10-19 26+1
 */

import { createRouter } from 'react-router-min'
import Home from './Home.js'
import NodeModules from './NodeModules.js'
import Module from './Module.js'

/**
 * routes is a keyValueObject, can be used in the following cases:
 * 1. if the name attribute is not required
 * 2. if you want to use simpler code
 */
const routes = {
    '/': Home,
    '/node_modules': NodeModules,
    '/node_modules/[...modulePath]': Module, // dynamic router
}

const { useRouter, Link, Main, routerList } = createRouter({
    routes,
    config: { base: '/2', type: 'history', cleanUrl: true, stripIndex: false },
})

// log routerList
console.table('routerList', routerList)

export { useRouter, Link, routerList, Main as default }
