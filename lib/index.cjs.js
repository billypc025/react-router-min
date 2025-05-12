const {
    useState,
    useEffect,
    useMemo,
    useCallback,
    createElement,
    useContext,
    Children,
    cloneElement,
} = require('react')

const DEFAULT_CONFIG = {
    /** The type of routing to use, either 'history' or 'hash'. */
    type: ['history', 'hash'],
    /** clean the URL by removing extension name, '/path/file.html' -> '/path/file' */
    cleanUrl: [true, false],
    /** strip "index" from the URL, '/path/index.html' -> '/path/' */
    stripIndex: [true, false],
}

/**
 * split pathname to node list
 *
 * eg:
 * '/' -> ['/']
 * '/path/a/b' -> ['/', 'path', 'a', 'b']
 * '/path/a/b/' -> ['/', 'path', 'a', 'b', '/']
 */
const PATH_NODE_PATTERN = /(?<=^\/)|(?!^)\/+(?<!$)|(?=\/$)/g

function parseConfig(config) {
    config = (typeof config === 'object' && config) || {}
    return Object.keys(DEFAULT_CONFIG).reduce(
        (c, v) => ((c[v] = DEFAULT_CONFIG[v].includes(c[v]) ? c[v] : DEFAULT_CONFIG[v][0]), c),
        { ...config, base: formatBase(config.base), presetQuery: formatPresetQuery(config.presetQuery) }
    )
}

function getPathname(options) {
    const { base, type } = options || {}
    let pathname = window.location.pathname
    if (base) {
        if (pathname.startsWith(`${base}/`)) {
            pathname = pathname.replace(base, '')
        } else {
            pathname = `${base
                .match(/\/[^/]+/g)
                .fill('..')
                .join('/')}${pathname}`
        }
    }
    if (type == 'hash' && pathname == `/` && window.location.hash !== '') {
        pathname = window.location.hash.replace(/^#|(?<!\?|#)(?:\?|#).*/g, '') || '/'
    }
    if (options) {
        // only one case:
        // input URL needs to be redirected because cleanUrl or stripIndex enabled.
        let { cleanUrl, stripIndex } = options
        if (cleanUrl || stripIndex) {
            let oldPathname = pathname
            options.cleanUrl && (pathname = pathname.replace(/\.\w+$/g, ''))
            options.stripIndex && (pathname = pathname.replace(/((?<=\/)index\.html|(?<=\/)index)$/g, ''))
            if (pathname != oldPathname) {
                if (type == 'hash') {
                    history.replaceState(null, '', window.location.hash.replace(oldPathname, pathname))
                } else {
                    history.replaceState(null, '', window.location.pathname.replace(oldPathname, pathname))
                }
            }
        }
    }
    return pathname
}

function getSearch(routerType) {
    if (routerType == 'hash') {
        return window.location.hash.replace(/^[^\?]+(?=\?)?|(?:#).*$/g, '')
    }
    return window.location.search
}

function getQuery(search) {
    if (!search) return {}
    try {
        if (typeof search == 'string') search = new URLSearchParams(search)
    } catch {
        return {}
    }
    let query = {}
    for (let [k, v] of search) {
        if (/^{.+}$|^\[.+\]$/.test(v)) {
            try {
                v = JSON.parse(v)
            } catch {}
        }
        query[k] = v
    }
    return query
}

function getOrigin() {
    return window.location.origin
}

function formatBase(base) {
    base = base || ''
    base !== '' && !base.startsWith('/') && (base = `/${base}`)
    base.endsWith('/') && (base = base.slice(0, -1))
    return base
}

function formatPresetQuery(presetQuery) {
    if (presetQuery && typeof presetQuery == 'object') {
        const keys = Object.keys(presetQuery).filter(k => /^[a-zA-Z]/.test(k))
        if (keys.length == 0) return null
        return keys.reduce((o, k) => ((o[k] = presetQuery[k]), o), {})
    }
    return null
}

function contains(query, presetQuery) {
    if (!presetQuery) return true
    return Object.keys(presetQuery).every(k => k in query)
}

function mergeQuery(query, presetQuery) {
    query = query || {}
    if (!presetQuery) return query
    return { ...presetQuery, ...query }
}

function pickQuery(query, presetQuery) {
    if (!presetQuery) return null
    return { ...presetQuery, ...Object.keys(presetQuery).reduce((o, k) => (k in query && (o[k] = query[k]), o), {}) }
}

function getValString(v) {
    return typeof v == 'object' ? JSON.stringify(v) : v
}

function getQueryString(query) {
    let str = Object.keys(query)
        .map(k => `${k}=${getValString(query[k])}`)
        .join('&')
    return str ? `?${str}` : ''
}

function getHistoryParams(targetUrl, options) {
    const { cleanUrl = true, stripIndex = true, query: queryProp } = options || {}
    let path, query
    if (typeof targetUrl == 'string') {
        ;[path, query] = targetUrl.split(/(?<=^[^?]+)\?/)
        query = getQuery(query)
        queryProp && (query = { ...queryProp, ...query })
    } else if (typeof targetUrl == 'object' && targetUrl.path) {
        ;[path, query] = targetUrl.path.split(/(?<=^[^?]+)\?/)
        query = { ...queryProp, ...getQuery(query), ...targetUrl.query }
    }
    cleanUrl && (path = path.replace(/\.\w+$/g, ''))
    stripIndex && (path = path.replace(/((?<=\/)index\.html|(?<=\/)index)$/g, ''))
    return [`${path}${getQueryString(query)}`, { path, query }]
}

function createDynamicPattern(path) {
    if (/\[\.{0,3}\w+\]/.test(path)) {
        let params = []
        let pattern = new RegExp(
            `^${path.replace(
                /\[(\.{0,3})(\w+)\]/g,
                (matchString, dot, name, start, end) => (
                    (end = start + matchString.length >= path.length),
                    params.push(dot ? [name] : name),
                    `(${dot ? (end ? '(?:[^/]+\\/?)*' : '[^/]+(?:\\/[^/]+)*') : `[^/]${end ? '*' : '+?'}`})`
                )
            )}$`
        )
        return { path, pattern, params, isDynamic: true }
    }
    return { path, isDynamic: false }
}

function matchPath(currentPath, { path, pattern, params }) {
    if (!pattern) return currentPath == path
    let matchs = pattern.exec(currentPath)
    if (!matchs) return false
    return params.reduce(
        (h, n, i) => (Array.isArray(n) ? (h[n[0]] = matchs[i + 1].split('/')) : (h[n] = matchs[i + 1]), h),
        {}
    )
}

function addRouter(pathname, component, rTree, { cleanUrl, stripIndex }) {
    let isDynamic = false
    pathname.split(PATH_NODE_PATTERN).reduce((o, v, i, a) => {
        cleanUrl && (v = v.replace(/\.\w+$/g, ''))
        stripIndex && (v = v.replace(/((?<=\/)index\.html|(?<=\/)index)$/g, ''))
        v = v.replace(/\[\.{3}|\[?\w+\]/g, '*')
        o[v] = o[v] || {}
        i == a.length - 1 &&
            (o[v][''] = { ...createDynamicPattern(pathname), component }) &&
            (isDynamic = o[v][''].isDynamic)
        return o[v]
    }, rTree)
    return isDynamic
}

function walk(paths, i, nodes, isds) {
    if (i > paths.length - 1) return nodes['']
    let p = paths[i] || '/'
    return (
        (nodes[p] && walk(paths, i + 1, nodes[p], false)) ||
        (isds && walk(paths, i + 1, nodes, true)) ||
        (!isds && nodes['*'] && walk(paths, i + 1, nodes['*'], false)) ||
        (!isds && nodes['**'] && walk(paths, i + 1, nodes['**'], true)) ||
        null
    )
}

function _pushUrl(target, options) {
    let { type, base } = options || {}
    type = type || 'history'
    base = formatBase(base)
    const [url, state] = getHistoryParams(target, options)
    history.pushState(state, '', `${base}${(type == 'hash' && '/#') || ''}${url}`)
    window.dispatchEvent(new PopStateEvent('popstate', { state }))
}

function _replaceUrl(target, options) {
    let { type, base } = options || {}
    type = type || 'history'
    base = formatBase(base)
    const [url, state] = getHistoryParams(target, options)
    history.replaceState(state, '', `${base}${(type == 'hash' && '/#') || ''}${url}`)
    window.dispatchEvent(new PopStateEvent('popstate', { state }))
}

function parseRoutes(routes, options) {
    if (!routes) return null
    if (routes && typeof routes === 'object') {
        const tree = {},
            names = {},
            components = {},
            list = []

        if (!Array.isArray(routes))
            routes = Object.keys(routes).map(k => ({
                path: k,
                name: routes[k].name || '',
                Component: routes[k],
            }))
        routes.forEach(item => parseRouter(item))

        function parseRouter({ path, name, Component, index, children }, basePath = '', layouts = []) {
            path = path || basePath
            name = name || (Component && Component.name) || path.substring(1)
            if (Component) layouts.push(Component)
            if (children) {
                children.forEach(item =>
                    parseRouter(item, `${basePath}${path}${!path.endsWith('/') ? '/' : ''}`, [...layouts])
                )
            } else {
                if (index !== true) path = `${basePath}${path}`
                names[name || path] = path
                components[name || path] = [...layouts]
                list.push({ path, name, Component, isDynamic: addRouter(path, name, tree, options) })
            }
        }
        return { tree, names, components, list }
    }
}

function createComponents(components, i, passProps, componentProps) {
    return createElement(
        components[i++],
        {
            ...passProps,
            ...(i == components.length && componentProps),
        },
        i < components.length && createComponents(components, i, passProps, componentProps)
    )
}

function _Link({ ref, base, query, options, children, ...props }) {
    options = options || {}
    return createElement(_$Link, { ref, _$options: { ...options, base }, origin, query, ...props }, children)
}

function _$Link({ ref, _$options: options, href, type, target, query, onClick, children, ...props }) {
    const base = formatBase(options.base)
    const [isExternal, setIsExternal] = useState(false)
    const [linkpath, setLinkpath] = useState(`${base}${href}`)
    const origin = props.origin || window.location.origin
    const path = props.pathname ? `${base}${props.pathname}` : window.location.pathname
    useEffect(() => {
        if (!href) return
        if (URL.canParse(href)) {
            // complete url
            if (href.startsWith(origin)) {
                // internal
                setIsExternal(false)
                setLinkpath(URL.parse(href).pathname)
            } else {
                // external
                setIsExternal(true)
            }
        } else if (!href.startsWith('/')) {
            setIsExternal(false)
            setLinkpath(new URL(href, `${origin}${path}`).pathname)
        } else {
            setIsExternal(false)
            setLinkpath(`${base}${href}`)
        }
    }, [href])
    const onClickLink = useCallback(
        e => {
            if (target !== '_blank' && !props.download && !isExternal) {
                e.preventDefault()
                e.stopPropagation()
            }
            onClick && onClick(e)
            if (linkpath && !isExternal) {
                if (type == 'replace') _replaceUrl(linkpath.substring(base.length), { ...options, query })
                else _pushUrl(linkpath.substring(base.length), { ...options, query })
            }
        },
        [onClick, linkpath, isExternal]
    )
    return linkpath
        ? createElement('a', { ref, href: linkpath, target, onClick: onClickLink, ...props }, children)
        : createElement('a', { ref, target, onClick: onClickLink, ...props }, children)
}

function createRouter({ routes, config } = {}) {
    const { ...options } = parseConfig(config)
    const { base, type, presetQuery } = options
    const routesInfo = parseRoutes(routes, options)
    const RouteContext = React.createContext()

    function pushUrl(target) {
        if (typeof target == 'object' && target.name) {
            if (!routesInfo) return
            const infoItem = routesInfo.list.find(v => v.name == target.name)
            if (!infoItem || infoItem.isDynamic) return
            target.path = infoItem.path
            delete target.name
        }
        if (presetQuery) _pushUrl(target, { ...options, query: pickQuery(getQuery(getSearch(type)), presetQuery) })
        else _pushUrl(target, options)
    }

    function replaceUrl(target) {
        if (typeof target == 'object' && target.name) {
            if (!routesInfo) return
            const infoItem = routesInfo.list.find(v => v.name == target.name)
            if (!infoItem || infoItem.isDynamic) return
            target.path = infoItem.path
            delete target.name
        }
        if (presetQuery) _replaceUrl(target, { ...options, query: pickQuery(getQuery(getSearch(type)), presetQuery) })
        else _replaceUrl(target, options)
    }

    function useRouter() {
        const { ...props } = useContext(RouteContext)
        return props
    }

    function Link({ ref, children, query, ...props }) {
        const { origin, path } = useRouter()
        presetQuery && (query = mergeQuery(query, pickQuery(getQuery(getSearch(type)), presetQuery)))
        return createElement(_$Link, { ref, origin, pathname: path, query, ...props, _$options: options }, children)
    }

    function Router({ path, component, children, ...props }) {
        const router = useContext(RouteContext)
        const pattern = useMemo(() => {
            return createDynamicPattern(path)
        }, [path])
        const params = router.path.startsWith('/') && matchPath(router.path, pattern)
        return (
            params !== false &&
            (component
                ? createElement(component, { router, ...props, ...params })
                : createElement(
                      React.Fragment,
                      {},
                      Children.map(children, child => {
                          return React.isValidElement(child) ? cloneElement(child, { router, ...params }) : child
                      })
                  ))
        )
    }

    function Main({ children }) {
        const [path, setPath] = useState(getPathname(options))
        const [query, setQuery] = useState(
            presetQuery ? mergeQuery(getQuery(getSearch(type)), presetQuery) : getQuery(getSearch(type))
        )
        const router = useMemo(() => ({ origin: getOrigin(), path, query, pushUrl, replaceUrl }), [path, query])
        const dynamicComponent = useMemo(
            () => routesInfo && path.startsWith('/') && walk(path.split(PATH_NODE_PATTERN), 0, routesInfo.tree, false),
            [path]
        )

        useEffect(() => {
            if (presetQuery) {
                const currentQuery = getQuery(getSearch(type))
                if (!contains(currentQuery, presetQuery)) {
                    const targetQuery = mergeQuery(query, presetQuery)
                    history.replaceState(
                        { path, query: targetQuery },
                        '',
                        `${base}${type == 'hash' ? '/#' : ''}${path}${getQueryString(targetQuery)}`
                    )
                }
            }
            if (type == 'hash' && window.location.hash == '') {
                history.replaceState(
                    { path, query },
                    '',
                    `${base}${type == 'hash' ? '/#' : ''}${path}${window.location.search}`
                )
            }
            // handle history.go or history.forward with popstate event.
            const popstateHandler = e => {
                // When history rolls back to the end, the state will be null,
                // so it is necessary to calculate the state based on the location.
                let state = e.state || {
                    path: getPathname(options),
                    query: getQuery(getSearch(type)),
                }
                setPath(state.path || '/')
                setQuery(state.query || {})
            }
            window.addEventListener('popstate', popstateHandler)
            return () => {
                window.removeEventListener('popstate', popstateHandler)
            }
        }, [])

        if (dynamicComponent) {
            const params = matchPath(path, dynamicComponent)
            const onlyChild = children && Children.only(children)
            return createElement(
                RouteContext.Provider || RouteContext,
                { value: router },
                (onlyChild ? cloneElement : createElement)(
                    onlyChild || React.Fragment,
                    onlyChild ? { router } : {},
                    createComponents(
                        routesInfo.components[dynamicComponent.component],
                        0,
                        { router },
                        {
                            ...params,
                        }
                    )
                )
            )
        }

        return React.createElement(
            RouteContext.Provider || RouteContext,
            { value: router },
            children && Children.map(children, child => cloneElement(child, { router }))
        )
    }

    return {
        useRouter,
        pushUrl,
        replaceUrl,
        Link,
        Router,
        Main,
        routerList: routesInfo ? routesInfo.list : [],
    }
}

exports.createRouter = createRouter
exports.pushUrl = _pushUrl
exports.replaceUrl = _replaceUrl
exports.Link = _Link
