/**
 * @highlight 8+2
 */

import { Link } from './AppRouter.js'
import { css } from './utils.js'

export default function Layout({ router, children }) {
    // RouterMin component will pass `{router}` to its children
    const { path } = router

    return (
        <>
            <div className={css('header', { home: path == '/' })}>
                <Link href='/'>Home</Link>
                <Link href='/node_modules'>node_modules</Link>
            </div>

            {children}
        </>
    )
}
