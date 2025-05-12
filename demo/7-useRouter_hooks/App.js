/**
 * @highlight 27-32
 */

import { createRouter } from 'react-router-min'
import { css } from './utils.js'

const routes = [
    { path: '/', name: 'Home', Component: Home },
    { path: '/docs', name: 'docs', Component: Home },
    { path: '/user', name: 'user', Component: Home },
    { path: '/setting', name: 'setting', Component: Home },
    { path: '/about', name: 'about', Component: Home },
    { path: '/login', name: 'login', Component: Home },

    //match all pathname not found in routes
    { path: '/[...paths]', name: '404', Component: Home },
]

// create a RouterMin instance
const { useRouter, Link, Main, routerList } = createRouter({
    routes,
    config: { base: '/7', type: 'history', cleanUrl: true, stripIndex: false },
})

function Home() {
    // const { path, query, push, replace }= useRouter()
    // path: location.pathname
    // query: location.search k-v Object
    // push: pushState(...)
    // replace: replaceState(...)
    const { path } = useRouter()
    const pageName = routerList.find(v => v.path == path)?.name || '404'

    return (
        <main className='home'>
            <div className='header home'>
                {routerList
                    .filter(v => !v.isDynamic) // filter dynamic routing
                    .map((v, i) => (
                        <Link
                            key={i}
                            href={v.path}
                            className={css({ actived: v.path == path })}
                        >
                            {v.name}
                        </Link>
                    ))}
                <Link href={`/${Math.random().toString().substring(3, 9)}`}>RandomPath</Link>
            </div>
            <p>
                This is <h1>{pageName}</h1> page.
            </p>
        </main>
    )
}

export default function App() {
    return <Main />
}
