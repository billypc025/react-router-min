/**
 * @highlight 14-14 21-23 25+1
 */

import { createRouter } from 'react-router-min'
import Layout from './Layout.js'
import Home from './Home.js'
import NodeModules from './NodeModules.js'
import Module from './Module.js'

const routes = [
    {
        path: '/',
        Component: Layout, // Each level node can set a `layout` component for children
        children: [
            // pathname: `/`
            { index: true, name: 'Home', Component: Home },
            {
                path: 'node_modules',
                children: [
                    // pathname: `/node_modules/`, equal to `/node_modules/index`
                    // Attention: different from `/node_modules`
                    { index: true, name: 'node_modules', Component: NodeModules },

                    // pathname: `/node_modules/[...modulePath]`
                    { path: '[...modulePath]', name: 'ModuleInfo', Component: Module },
                ],
            },
        ],
    },
]

const { useRouter, Link, Main, routerList } = createRouter({
    routes,
    config: { base: '/5', type: 'history', cleanUrl: true, stripIndex: false },
})

export { useRouter, Link, routerList, Main as default }
