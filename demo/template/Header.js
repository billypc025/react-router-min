import { Link, useRouter, routerList } from './AppRouter.js'
import { css } from './utils.js'

export default function Header({ router }) {
    const { path } = router || useRouter()

    return (
        <div className={css('header', { home: path == '/' })}>
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
