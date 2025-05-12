/**
 * @highlight 32-32 37-37 54-54 59-59 70-71 75-77
 */

import { createRouter } from 'react-router-min'

const routes = [
    { path: '/', Component: Home },
    { path: '/[...paths]', Component: Home },
]

const { Link, Main, useRouter } = createRouter({
    routes,
    config: { base: '/8', stripIndex: false },
})

function Home() {
    const { path } = useRouter()

    return (
        <div className='api-demo'>
            <div className='block'>
                <h2>{path}</h2>
            </div>

            <div className='block'>
                <h2>absolute href: /foo, /foo/child-foo</h2>
                <div className='column'>
                    <h3>absolute Link</h3>
                    <div>
                        <pre>{`<Link href='/path_1'>`}</pre>
                        <Link href='/path_1'>/path_1</Link>
                    </div>
                    <h3>absolute Link index</h3>
                    <div>
                        <pre>{`<Link href='/path_1/'>`}</pre>
                        <Link href='/path_1/'>/path_1/</Link>
                    </div>
                </div>
            </div>

            <div className='block'>
                <h2>relative href: ./foo, foo/child-foo</h2>
                <p className='comment'>
                    The relative link needs to refresh the page in order to reposition the relative path.
                </p>
                <p className='comment'>
                    Relative links are always relative to the location.pathname on Link component creating.
                </p>
                <div className='column'>
                    <h3>relative Link</h3>
                    <div>
                        <pre>{`<Link href='path_2'>path_2</Link>`}</pre>
                        <Link href='path_2'>path_2</Link>
                    </div>
                    <h3>relative Link index</h3>
                    <div>
                        <pre>{`<Link href='path_2/'>path_2/</Link>`}</pre>
                        <Link href='path_2/'>path_2/</Link>
                    </div>
                </div>
            </div>

            <div className='block'>
                <h2>External URL</h2>
                <p className='comment'>Link component will automatically determine external url.</p>
                <div className='column'>
                    <h3>full Link</h3>
                    <pre>{`<Link href='http://localhost:8080/path_3'>`}</pre>
                    <Link href='http://localhost:8080/path_3'>http://localhost:8080/path_3</Link>
                </div>
                <div className='column'>
                    <h3>external Link</h3>
                    <pre>{`<Link href='https://github.com/billypc025/react-router-min.git'>`}</pre>
                    <Link href='https://github.com/billypc025/react-router-min.git'>
                        https://github.com/billypc025/react-router-min.git
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function App() {
    return <Main />
}
