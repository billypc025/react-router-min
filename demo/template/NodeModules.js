/**
 * pathname: '/node_modules'
 */

import { useState, useEffect } from 'react'
import { Link } from './AppRouter.js'

export default function NodeModules() {
    const [nodeModules, setNodeModules] = useState([])
    useEffect(() => {
        ;(async () => {
            const { list } = await _fetch('get-node-modules')
            setNodeModules(list)
        })()
    }, [])
    return (
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
    )
}
