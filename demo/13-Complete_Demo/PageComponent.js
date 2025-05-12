import { useState, useEffect } from 'react'
import { Link } from './AppRouter.js'

// path: '/'
export function Home({ router }) {
    return (
        <>
            <main className='home'>
                <h1>react-router-min</h1>
                <p>Only 5k. A lightweight react router component and hooks for ReactJS.</p>
            </main>
        </>
    )
}

// path: '/node_modules'
export function NodeModules() {
    const [nodeModules, setNodeModules] = useState([])
    useEffect(() => {
        ;(async () => {
            const { list } = await _fetch('get-node-modules')
            setNodeModules(list)
        })()
    }, [])
    return (
        <>
            <div className='main package-list'>
                {nodeModules.map((v, i) => (
                    <Link
                        key={i}
                        href={`/node_modules/${v}`}
                        className='package-item'
                    >
                        {v}
                    </Link>
                ))}
            </div>
        </>
    )
}

// path: '/node_modules/[...modulePath]'
export function Module({ modulePath }) {
    console.log(modulePath)
    const [pkgJson, setPkgJson] = useState(null)
    useEffect(() => {
        ;(async () => {
            const { pkg } = await _fetch('get-package-json', { packageName: modulePath.join('/') })
            setPkgJson(pkg)
        })()
    }, [])
    return (
        <>
            <div className='main package-detail'>
                <h1>{modulePath.join('/')}</h1>
                {pkgJson && (
                    <>
                        <p>version: {pkgJson.version}</p>
                        <p>{pkgJson.description}</p>

                        <Link href={pkgJson.homepage}>{pkgJson.homepage}</Link>

                        {pkgJson.dependencies && (
                            <>
                                <h3>dependencies:</h3>
                                <div>
                                    {Object.keys(pkgJson.dependencies).map(dep => (
                                        <p key={dep}>{dep}</p>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    )
}

async function _fetch(api, data) {
    const result = await fetch(`/api/${api}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return await result.json()
}
