/**
 * @highlight 16+1 66+1 70+1 77+1 81+1 88+1 92+1 96+1 101+5 109-112 115-121
 */

import { createRouter } from 'react-router-min'

const routes = [
    { path: '/', Component: Home },
    { path: '/search', Component: Home },
]

const { Main, Link, useRouter, pushUrl } = createRouter({
    routes,
    config: {
        base: '/11',
        // presetQuery is forever existing, can be covered.
        presetQuery: { lang: 'js', page: 1 },
        type: 'history',
        cleanUrl: true,
        stripIndex: false,
    },
})

function Home() {
    const { path, query } = useRouter()

    // get query
    console.log({ query })

    const onClick = n => {
        switch (n) {
            case 1:
                pushUrl('/search')
                break
            case 2:
                pushUrl('/search?k=keyword1&type=esm')
                break
            case 3:
                pushUrl({
                    path: '/search?k=keyword2&page=2',
                })
                break
            case 4:
                pushUrl({
                    path: '/search?k=keyword3',
                    query: { page: 3 },
                })
                break
            case 5:
                pushUrl({
                    path: '/search',
                    query: {
                        k: 'keyword4',
                        page: 4,
                    },
                })
                break
        }
    }

    return (
        <div className='api-demo'>
            <div className='block'>
                <h2>Automatically add preset query</h2>
                <div>
                    <pre>{`pushUrl('/search')`}</pre>
                    <button onClick={() => onClick(1)}>go</button>
                </div>
                <div>
                    <pre>{`<Link href='/search'>`}</pre>
                    <Link href='/search'>/search</Link>
                </div>
            </div>
            <div className='block'>
                <h2>all query will merge automatically</h2>
                <div>
                    <pre>pushUrl('/search?k=keyword1&type=esm')</pre>
                    <button onClick={() => onClick(2)}>go</button>
                </div>
                <div>
                    <pre>{`<Link href='/search?k=keyword1&type=esm'>`}</pre>
                    <Link href='/search?k=keyword1&type=esm'>k=keyword1 & type=esm</Link>
                </div>
            </div>
            <div className='block'>
                <h2>override preset query</h2>
                <div>
                    <pre>{`pushUrl({\n    path: '/search?k=keyword2&page=2`}</pre>
                    <button onClick={() => onClick(3)}>go</button>
                </div>
                <div>
                    <pre>{`<Link href='/search?k=keyword2&page=2'>`}</pre>
                    <Link href='/search?k=keyword2&page=2'>k=keyword2 & page=2</Link>
                </div>
                <div>
                    <pre>{`pushUrl({\n    path: '/search?k=keyword3',\n    query: {page: 3}\n})`}</pre>
                    <button onClick={() => onClick(4)}>go</button>
                </div>
                <div>
                    <pre>{`<Link\n    href='/search?k=keyword3\n    query={{ page: 3 }}'\n>`}</pre>
                    <Link
                        href='/search?k=keyword3'
                        query={{ page: 3 }}
                    >
                        k=keyword3 & page=3
                    </Link>
                </div>
                <div>
                    <pre>
                        {`pushUrl({\n    path: '/search',\n    query: {\n        k: 'keyword4',\n        page: 4\n    }\n})`}
                    </pre>
                    <button onClick={() => onClick(5)}>go</button>
                </div>
                <div>
                    <pre>{`<Link\n    href='/search'\n    query={{ k: 'keyword4', page: 4 }}'\n>`}</pre>
                    <Link
                        href='/search'
                        query={{ k: 'keyword4', page: 4 }}
                    >
                        k=keyword4 & page=4
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function App() {
    return <Main />
}
