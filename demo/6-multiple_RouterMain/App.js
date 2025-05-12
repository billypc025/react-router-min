/**
 * @highlight 6-6 15-15 20-26
 */

import AppRouter from './AppRouter.js'
import AppRouter2 from './AppRouter_2.js' // second RouterMin instance
import Layout from './Layout.js'

export default function App() {
    return (
        <>
            <AppRouter>
                <Layout />
            </AppRouter>
            <AppRouter2 />
        </>
    )
}

/**
 * You can compare these two URLs
 *
 * 1. http://localhost:8080/6/node_modules/@babel/parse  (match AppRoute_2)
 *
 * 2. http://localhost:8080/6/node_modules/babel-loader  (not match AppRoute_2)
 */
