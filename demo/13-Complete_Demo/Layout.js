import { Link, useRouter, routerList } from './AppRouter.js'
import { css } from './utils.js'

function Header() {
    const { path } = useRouter()
    return (
        <div className={css('header', path == '/' && 'home')}>
            {routerList
                .filter(v => !v.isDynamic)
                .map(v => (
                    <Link
                        key={v.path}
                        href={v.path}
                        className={css(path == v.path && 'actived')}
                    >
                        {v.name}
                    </Link>
                ))}
        </div>
    )
}

export default function Layout({ router, children }) {
    return (
        <>
            <Header router={router} />
            {children}
        </>
    )
}
