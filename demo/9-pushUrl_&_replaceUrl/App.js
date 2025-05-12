/**
 * @highlight 25-32 52-53 56-57
 */

import { useRef, useState } from 'react'
import { createRouter } from 'react-router-min'

const routes = [
    { path: '/', Component: Home },
    { path: '/[...paths]', Component: Home },
]

const { Main, useRouter, pushUrl, replaceUrl } = createRouter({
    routes,
    config: { base: '/9', type: 'history', cleanUrl: true, stripIndex: false },
})

function Home() {
    const { path } = useRouter()
    const [pathList, setPathList] = useState([path])
    const num = useRef(0)

    const onClick = popType => {
        num.current++
        const targetPath = `/path_${num.current}`
        if (popType == 'push') {
            setPathList([...pathList, targetPath])
            pushUrl(targetPath)
        } else if (popType == 'replace') {
            setPathList([...pathList.slice(0, -1), targetPath])
            replaceUrl(targetPath)
        }
    }

    const onClickBack = () => {
        if (pathList.length > 1) {
            setPathList([...pathList.slice(0, -1)])
            num.current >= 0 && history.back()
        }
    }

    const onClickReset = () => {
        num.current = 0
        setPathList(['/'])
        replaceUrl('/')
    }

    return (
        <div className='api-demo'>
            <div className='block'>
                <div>
                    <pre>{`pushUrl('/path_${num.current + 1}')`}</pre>
                    <button onClick={() => onClick('push')}>go</button>
                </div>
                <div>
                    <pre>{`replaceUrl('/path_${num.current + 1}')`}</pre>
                    <button onClick={() => onClick('replace')}>go</button>
                </div>
            </div>

            <div className='block'>
                <div>
                    <h2>history</h2>
                    <div>
                        <button onClick={onClickBack}>history.back()</button>
                        <button onClick={onClickReset}>reset</button>
                    </div>
                </div>
                <div className='flow'>
                    {pathList.map((v, i) => (
                        <span key={v + i}>{v}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function App() {
    return <Main />
}
