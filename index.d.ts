import { FunctionComponent } from 'react'

/**
 * A function to handle history state changes.
 * @param url - The URL string or an object containing path and query parameters.
 */
export type HistoryStateCall = (
    url: string | { path: 'string'; query?: Record<string, any> } | { name: 'string'; query?: Record<string, any> }
) => void

/**
 * Router context object containing routing information and navigation methods.
 *
 * @example
 *
 * const { path, query } = useRouter()
 */
export type RouterCTX = {
    /** The origin of the current URL. */
    origin: string
    /** The current path of the router. */
    path: string
    /** The query parameters of the current URL. */
    query: Record<string, any>
    /** Function to push a new URL to the history stack. */
    pushUrl: HistoryStateCall
    /** Function to replace the current URL in the history stack. */
    replaceUrl: HistoryStateCall
}

/**
 * Link component for creating navigation links.
 * @param type - Specifies whether the link performs a 'push' or 'replace' navigation.
 *
 * @example
 *
 * <Link href="/">Home</Link>
 *
 * <Link href="/login" type="replace">login</Link>
 */
export type RouterLink = FunctionComponent<
    {
        /** history pop state type */
        type?: 'push' | 'replace'
        /** external query, automatically merge to URL */
        query?: Record<string, any>
    } & HTMLAnchorElement
>

/**
 * Router component representing a single route.
 * @param path - The path for the route.
 * @param component - The component to render for the route.
 *
 * @example
 *
 * <Router path="/about" Component={AboutComponent} />
 *
 * <Router path="/about">
 *    <AboutComponent />
 * </Router>
 *
 * <Router path="/about" Component={AboutComponent}>
 *    <Layout />
 * </Router>
 */
export type RouterItem = FunctionComponent<{ path: string; component?: FunctionComponent<{ router: RouterCTX }> }>

/** Router Main component representing the main router container. */
export type RouterMain = FunctionComponent

/**
 * Creates a router instance with the specified options.
 * @param options - Configuration options for the router.
 * @returns An object containing router utilities and components.
 *
 * @example
 *
 * const {Main, Link, useRouter} = createRouter({routes, config:{type:'history', cleanUrl:true, stripIndex:true} })
 */
export function createRouter(options?: {
    /** A record of routes mapping paths to React components. */
    routes?: Record<string, FunctionComponent>
    /** Configuration for the router behavior. */
    config?: {
        /** router base pathname. Defaults to `''` */
        base?: string
        /** preset query record, forever existing, can be covered. */
        presetQuery?: Record<string, any>
        /** The type of routing to use, either 'history' or 'hash'. Defaults to `'history'` */
        type?: 'history' | 'hash'
        /** Whether to clean the URL by removing extension name. Defaults to `true`. */
        cleanUrl?: Boolean
        /** Whether to strip "index" from the URL path. Defaults to `true`. */
        stripIndex?: Boolean
    }
}): {
    /** Hook to access the router context. */
    useRouter: () => RouterCTX
    /** Function to push a new URL to the history stack. */
    pushUrl: HistoryStateCall
    /** Function to replace the current URL in the history stack. */
    replaceUrl: HistoryStateCall
    /**
     * Link component for creating navigation links.
     * @param type - Specifies whether the link performs a 'push' or 'replace' navigation. Defaults to `'history'`
     *
     * @example
     *
     * <Link href="/">Home</Link>
     *
     * <Link href="/login" type="replace">login</Link>
     */
    Link: RouterLink
    /** Router component for defining routes. */
    Router: RouterItem
    /** Main component for the main router container. */
    Main: RouterMain
    /** List of all registered routes. */
    routerList: { path: string; name: string; Component: FunctionComponent<any>; isDynamic: boolean }[]
}

/**
 * Pushes a new URL to the history stack.
 * @param url - The URL string or an object containing path and query parameters.
 * @param options - Additional options for URL handling.
 */
export function pushUrl(
    url: string | { path: 'string'; query?: Record<string, any> },
    options?: {
        /** router base pathname. Defaults to '' */
        base?: string
        /** external query, automatically merge to URL */
        query?: Record<string, any>
        /** The type of routing to use, either 'history' or 'hash'. Defaults to `'history'` */
        type?: 'history' | 'hash'
        /** Whether to clean the URL by removing extension name. Defaults to `true`. */
        cleanUrl?: Boolean
        /** Whether to strip "index" from the URL path. Defaults to `true`. */
        stripIndex?: Boolean
    }
): void

/**
 * Replaces the current URL in the history stack.
 * @param url - The URL string or an object containing path and query parameters.
 * @param options - Additional options for URL handling.
 */
export function replaceUrl(
    url: string | { path: 'string'; query?: Record<string, any> },
    options?: {
        /** router base pathname. Defaults to '' */
        base?: string
        /** external query, automatically merge to URL */
        query?: Record<string, any>
        /** The type of routing to use, either 'history' or 'hash'. Defaults to `'history'` */
        type?: 'history' | 'hash'
        /** Whether to clean the URL by removing extension name. Defaults to `true`. */
        cleanUrl?: Boolean
        /** Whether to strip "index" from the URL path. Defaults to `true`. */
        stripIndex?: Boolean
    }
): void

/**
 * Link component for creating navigation links.
 * @param base - router base pathname. Defaults to `''`
 * @param query - searchParams
 * @param type - Specifies whether the link performs a 'push' or 'replace' navigation. Defaults to `'history'`
 * @param options - Additional options for URL handling.
 *
 * @example
 *
 * <Link href="/">Home</Link>
 *
 * <Link href="/login" type="replace">login</Link>
 */
export const Link: FunctionComponent<
    {
        type?: 'push' | 'replace'
        /** router base pathname. Defaults to `''` */
        base?: string
        /** searchParams */
        query?: Record<string, any>
        options?: {
            /** router base pathname. Defaults to '' */
            base?: string
            /** The type of routing to use, either 'history' or 'hash'. Defaults to `'history'` */
            type?: 'history' | 'hash'
            /** Whether to clean the URL by removing extension name. Defaults to `true`. */
            cleanUrl?: Boolean
            /** Whether to strip "index" from the URL path. Defaults to `true`. */
            stripIndex?: Boolean
        }
    } & HTMLAnchorElement
>
