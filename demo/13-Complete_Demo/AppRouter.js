import { createRouter } from 'react-router-min'
import { Home, NodeModules, Module } from './PageComponent.js'

const routes = [
    { path: '/', name: 'Home', Component: Home },
    { path: '/node_modules', name: 'node_modules', Component: NodeModules },
    { path: '/node_modules/[...modulePath]', Component: Module },
]

// create a RouterMin instance
const {
    useRouter, // hooks is you need
    Link, // <a> wrapper for SPA, use history popstate to navigate to a.href.
    Main, // RouterMin root wrapper
    routerList,
} = createRouter({
    routes,
    config: { base: '/13', type: 'history', cleanUrl: true, stripIndex: false },
})

export { useRouter, Link, routerList, Main }
