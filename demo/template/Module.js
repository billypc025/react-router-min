/**
 * pathname: '/node_modules/[...modulePath]'
 */

import { useState, useEffect } from 'react'
import { Link } from './AppRouter.js'

export default function Module({ modulePath }) {
    console.log('[Module.js]', 'modulePath:', modulePath)
    const [pkgJson, setPkgJson] = useState(null)
    useEffect(() => {
        ;(async () => {
            const { pkg } = await _fetch('get-package-json', { packageName: modulePath.join('/') })
            setPkgJson(pkg)
        })()
    }, [])
    return (
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
    )
}
