/**
 * @highlight 9+2
 */

import { createRouter } from 'react-router-min'
import Scope from './Scope.js'

const routes = {
    // Only match `@scope/package`
    // match `@babel/core`, but not `babel-load`
    // eg: `http://localhost:8080/6/node_modules/@babel/parser`
    '/node_modules/[scopeName]/[packageName]': Scope,
}

const { Main, Link } = createRouter({ routes, config: { base: '/6' } })

export { Link, Main as default }
