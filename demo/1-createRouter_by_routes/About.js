/**
 * pathname: '/about'
 */

import { Link } from 'react-router-min'

export default function About() {
    return (
        <main>
            <h2>install</h2>
            <p>npm install react-router-min</p>
            <h2>repository</h2>
            <p>
                <Link href='https://github.com/billypc025/react-router-min.git'>
                    https://github.com/billypc025/react-router-min.git
                </Link>
            </p>
            <h2>UMD</h2>
            <p>lib/index.umd.js</p>
            <h2>ESM</h2>
            <p>lib/index.esm.js</p>
            <h2>CJS</h2>
            <p>lib/index.cjs.js</p>
        </main>
    )
}
