/**
 * @highlight 9-10 22-23 28-28 31+2 36+3 42+6 51+6 67+3 76+3 85+3 94+3 103+3
 */

import { createRouter } from 'react-router-min'

const routes = [
    { path: '/', Component: Home },
    // set name: search
    { path: '/search', name: 'search', Component: Home },
    { path: '/[...paths]', Component: Home },
]

const { Main, useRouter, pushUrl } = createRouter({
    routes,
    config: { base: '/10', type: 'history', cleanUrl: true, stripIndex: false },
})

function Home() {
    const { path, query } = useRouter()

    // get query
    console.log({ query })

    const onClick = n => {
        switch (n) {
            case 1:
                pushUrl('/search?k=js&t=1')
                break
            case 2:
                pushUrl({
                    path: '/search?k=ts&t=1',
                })
                break
            case 3:
                pushUrl({
                    path: '/search?k=node',
                    query: { t: 2 },
                })
                break
            case 4:
                pushUrl({
                    path: '/search',
                    query: {
                        k: 'js',
                        t: 2,
                    },
                })
                break
            case 5:
                pushUrl({
                    name: 'search',
                    query: {
                        k: 'ts',
                        t: 2,
                    },
                })
                break
        }
    }

    return (
        <div className='api-demo'>
            <div className='block'>
                <h2>query are all of type string</h2>
                <div>
                    <pre>
                        <code>pushUrl('/search?k=js&t=1')</code>
                    </pre>
                    <button onClick={() => onClick(1)}>ok</button>
                </div>
            </div>
            <div className='block'>
                <h2>can use Object to specify the path</h2>
                <div>
                    <pre>
                        <code>{`pushUrl({\n    path: '/search?k=ts&t=1'\n})`}</code>
                    </pre>
                    <button onClick={() => onClick(2)}>ok</button>
                </div>
            </div>
            <div className='block'>
                <h2>query will automatically merge</h2>
                <div>
                    <pre>
                        <code>{`pushUrl({\n    path: '/search?k=node',\n    query: {t: 2}\n})`}</code>
                    </pre>
                    <button onClick={() => onClick(3)}>ok</button>
                </div>
            </div>
            <div className='block'>
                <h2>using object will got correct type (recommended)</h2>
                <div>
                    <pre>
                        <code>{`pushUrl({\n    path: '/search',\n    query: {\n        k: 'js',\n        t: 2\n    }\n})`}</code>
                    </pre>
                    <button onClick={() => onClick(4)}>ok</button>
                </div>
            </div>
            <div className='block'>
                <h2>using name instead of path (recommended)</h2>
                <div>
                    <pre>
                        <code>{`pushUrl({\n    name: 'search',\n    query: {\n        k: 'ts',\n        t: 2\n    }\n})`}</code>
                    </pre>
                    <button onClick={() => onClick(5)}>ok</button>
                </div>
            </div>
        </div>
    )
}

export default function App() {
    return <Main />
}
