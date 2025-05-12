/**
 * @highlight 6-6
 */

import { useState, useEffect } from 'react'
import { Link } from './AppRouter_2.js' // Link component from AppRouter_2.js

export default function Scope({ scopeName, packageName }) {
    const [nodeModules, setNodeModules] = useState([])

    useEffect(() => {
        ;(async () => {
            console.log('[Scope.js]', { scopeName, packageName })
            const { list } = await _fetch('get-node-modules', { scopeName })
            setNodeModules(list)
        })()
    }, [])

    return (
        <>
            <div className='main scope'>
                <h2>{scopeName}</h2>
                <div className='main package-list scope-list'>
                    {nodeModules.map((v, i) => (
                        <Link
                            key={i}
                            href={`/node_modules/${scopeName}/${v}`}
                            className='package-item'
                        >
                            {v}
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}
