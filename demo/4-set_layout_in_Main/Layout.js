/**
 * @highlight 8-9
 */

import Header from './Header.js'

export default function Layout({ children, router }) {
    // layout can got `router`
    console.log('[Layout.js]', router)

    return (
        <>
            <Header />
            {children}
        </>
    )
}
