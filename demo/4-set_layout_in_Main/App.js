/**
 * @highlight 10-10 14-14
 */

import AppRouter from './AppRouter.js'
import Layout from './Layout.js'

export default function App() {

    // `return <AppRouter />` if no layout is required

    return (
        <AppRouter>
            <Layout />
        </AppRouter>
    )
}
