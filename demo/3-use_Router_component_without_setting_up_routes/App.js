/**
 * @highlight 17-20 24+1 29+1
 */

import { Main, Router } from './AppRouter.js'

import Layout from './Layout.js'
import Home from './Home.js'
import NodeModules from './NodeModules.js'
import Module from './Module.js'

// routing by `<Router />` component
export default function App() {
    return (
        <Main>
            <Layout>
                <Router path='/'>
                    {/* pass PageComponent with `children` */}
                    <Home />
                </Router>

                <Router
                    path='/node_modules'
                    // pass PageComponent with `component` property
                    component={NodeModules}
                />

                <Router
                    // support `dynamic routing`
                    path='/node_modules/[...modulePath]'
                    component={Module}
                />
            </Layout>
        </Main>
    )
}
