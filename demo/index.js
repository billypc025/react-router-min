import Path from 'node:path'
import FS from 'node:fs'
import URL from 'node:url'
import webpack from 'webpack'
import webpackDevServer from 'webpack-dev-server'
import TerserPlugin from 'terser-webpack-plugin'
import express from 'express'
import bodyParser from 'body-parser'
import { parse } from '@babel/parser'
import { parse as acornParse } from 'acorn'
import { fs } from 'memfs'

const moduleType = ['esm', 'umd'].includes(process.argv[2]) ? process.argv[2] : 'umd'
process.env.NODE_ENV = 'development'
const __filename = URL.fileURLToPath(import.meta.url)
const __projpath = (...arg) => Path.resolve(__filename, '../../', ...arg)
const __path = (...arg) => Path.resolve(__filename, '../', ...arg)
const TOKEN_TYPES = {
    keyword: ['function', 'let', 'const', 'if', 'else', 'for', 'new', '*', 'true', 'false', 'null', 'async', 'typeof'],
    import: ['import', 'from', 'return', '[', ']', 'export', 'default', 'await', 'switch', 'case', 'break', 'while'],
    bracket: ['(', ')', 'num'],
    brace: ['{', '}', '${'],
    symbol: ['=', '&&', '||', '.', ',', ':', ';', '?', '!', '+/-', '==/!=/===/!==', '?.', '++/--', '</>/<=/>=', '...'],
    string: ['string', 'template', '`'],
    name: ['Identifier', 'name', '=>'],
    jsxTag: ['jsxTagStart', 'jsxTagEnd', 'jsxIdentifier'],
    jsxAttr: ['jsxAttribute'],
    jsx: ['jsxName', '=>'],
    jsxText: ['jsxText', ';'],
    regex: ['regexp'],
}

fs.mkdirSync(`/src`)
fs.mkdirSync(`/template`)
FS.readdirSync(__path('template')).map(v => {
    fs.writeFileSync(`/template/${v}`, FS.readFileSync(__path('template', v), 'utf-8'))
    if (Path.extname(v) == '.js') fs.writeFileSync(`/src/${v}`, getDemoCode(__path('template', v)))
})
fs.mkdirSync(`/js`)
fs.writeFileSync('/js/react-router-min.js', FS.readFileSync(__projpath(`lib/index.umd.js`)))
fs.writeFileSync('/js/react.development.js', FS.readFileSync(__projpath('node_modules/react/umd/react.development.js')))
fs.writeFileSync(
    '/js/react-dom.development.js',
    FS.readFileSync(__projpath('node_modules/react-dom/umd/react-dom.development.js'))
)
fs.writeFileSync('/readme.md', FS.readFileSync(__projpath('README.md')))

const templateFileList = [
    'main.js',
    'App.js',
    'AppRouter.js',
    'Layout.js',
    'Header.js',
    'Home.js',
    'NodeModules.js',
    'Module.js',
]

const hybridFS = {
        ...FS,
        stat(filePath, cb) {
            if (filePath.startsWith(__path('')) && !FS.existsSync(filePath)) {
                filePath = `/template/${Path.basename(filePath)}`
                fs.stat(filePath, cb)
            } else {
                fs.stat(filePath, (err, stats) => {
                    if (err || !stats) {
                        FS.stat(filePath, cb)
                    } else {
                        cb(err, stats)
                    }
                })
            }
        },
        readFile: (filePath, encoding, callback) => {
            if (filePath.startsWith(__path('')) && !FS.existsSync(filePath)) {
                const dirname = Path.basename(Path.dirname(filePath))
                filePath = `/template/${Path.basename(filePath)}`
                if (filePath == '/template/AppRouter.js') {
                    fs.readFile(filePath, 'utf-8', (err, content) => {
                        content = content.replace(`{demoId}`, `/${dirname.split('-')[0]}`)
                        ;(callback || encoding)(err, content)
                    })
                } else {
                    fs.readFile(filePath, encoding, callback)
                }
            } else {
                FS.readFile(filePath, encoding, callback)
            }
        },
    },
    entry = {},
    demoList = FS.readdirSync(__path('.'), { withFileTypes: true })
        .filter(v => v.isDirectory() && /^\d+-[^/]+$/.test(v.name))
        .map(({ name }) => {
            const [id, title] = name.split(/(?<=^\d+)-/g)
            fs.mkdirSync(`/src/${id}`)
            fs.mkdirSync(`/js/${id}`)
            const list = FS.readdirSync(__path(name)).sort(sortByTemplateList)
            list.forEach(v => {
                fs.writeFileSync(`/src/${id}/${v}`, getDemoCode(__path(name, v), list))
            })
            return {
                id: Number(id),
                name,
                title: title.replace(/_/g, ' '),
                path: __path(name),
                bundle: `${name}.js`,
                main: __path(name, 'main.js'),
                list,
                templates: [],
                hash: '',
            }
        })
        .sort((a, b) => a.id - b.id),
    demoMap = demoList.reduce((o, v) => ((entry[v.name] = v.main), { ...o, [v.id]: v }), {})

start()

async function start() {
    const port = 8080
    const compiler = webpack({
        mode: 'development',
        entry,
        output: {
            filename: '[name].js',
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [['babel-preset-react-app', { runtime: 'automatic' }]],
                        },
                    },
                },
            ],
        },
        ...(moduleType == 'esm' && {
            resolve: {
                alias: {
                    'react-router-min': __projpath('lib/index.esm.js'),
                },
            },
        }),
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                }),
            ],
            runtimeChunk: false,
            splitChunks: false,
            emitOnErrors: false,
        },
        externals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            ...(moduleType == 'umd' && { 'react-router-min': 'ReactRouterMin' }),
        },
        infrastructureLogging: {
            level: 'none',
            debug: false,
        },
        stats: 'none',
    })
    compiler.inputFileSystem = hybridFS
    compiler.outputFileSystem = hybridFS

    const devServer = new webpackDevServer(
        {
            hot: true,
            host: '0.0.0.0',
            port: port,
            compress: true,
            open: true,
            client: {
                logging: 'none',
            },
        },
        compiler
    )
    const ip = webpackDevServer.findIp('v4', false)

    let isStarted = false,
        gotError = false,
        startTime
    devServer.startCallback(() => {
        console.log(CSI(34), 'Starting the development server...', CSI(39), '\n\n')
        initApp(devServer.app)
    })
    compiler.watch({}, (err, stats) => {
        if (isStarted) {
            const json = stats.toJson({
                chunks: true,
            })
            json.chunks.forEach(v => {
                const [id] = /^\d+(?=-)/.exec(v.files[0])
                const demoInfo = demoMap[id]
                if (demoInfo.hash != v.hash) {
                    demoInfo.hash = v.hash
                    const { id, name, path, list } = demoInfo
                    list.forEach(v => {
                        try {
                            fs.writeFileSync(`/src/${id}/${v}`, getDemoCode(__path(name, v), list))
                        } catch {
                            console.error(`Syntax error: ${__path(name, v)}`)
                        }
                    })
                    demoInfo.templates = []
                    v.modules.forEach(({ id: moduleId }) => {
                        if (Path.dirname(__projpath(moduleId)) == path && !list.includes(Path.basename(moduleId))) {
                            demoInfo.templates.push(Path.basename(moduleId))
                        }
                    })
                    demoInfo.templates.sort(sortByTemplateList)
                }
            })
        }
    })
    compiler.hooks.afterDone.tap('afterDone', () => {
        if (!isStarted && !gotError) {
            isStarted = true
            process.stdout.write(CSI('1G4A2K'))
            console.log(
                `${CSI(1, 32)}Local:            http://localhost:${port}\nOn Your Network:  http://${ip}:${port}
            `,
                CSI('22,39,1B1G')
            )
        }
    })
    compiler.hooks.beforeCompile.tap('beforeCompile', () => {
        startTime = performance.now()
    })
    compiler.hooks.emit.tap('bundle.js', compilation => {
        compilation.assetsInfo.forEach((info, filename) => {
            if (entry[Path.parse(filename).name]) {
                const [id] = /^\d+(?=-)/.exec(filename)
                fs.writeFileSync(`/js/${id}/bundle.js`, compilation.assets[filename].source())
            }
        })
    })
    compiler.hooks.done.tap('done', stats => {
        const { errors } = stats.toJson({
            all: false,
            warnings: false,
            errors: true,
        })
        if (errors && errors.length > 0) {
            gotError = true
            console.log(CSI(31), errors.map(({ message }) => message).join('\n\n'), CSI(39))
            process.exit()
        } else {
            console.log(
                'webpack compiled',
                `${CSI(32)}successfully${CSI(39)}`,
                'in',
                (performance.now() - startTime).toFixed(0),
                'ms'
            )
        }
    })
}

function initApp(app) {
    app.use((req, res, next) => {
        next()
    })
    app.get('/js/*', async (req, res) => {
        try {
            send(res, await fs.promises.readFile(req.path), 'js')
        } catch {
            res.status(404).end()
        }
    })
    app.get('/css/style.css', async (req, res) => {
        send(res, await fs.promises.readFile('/template/style.css', 'utf-8'), 'css')
    })
    app.use(bodyParser.json())
    app.get('/src/*', async (req, res) => {
        if (/^\/src\/\d+\/\w+\.js$/.test(req.path)) {
            const [, id, name] = /^\/src\/(\d+)\/(\w+\.js)$/.exec(req.path)
            const demoInfo = demoMap[id]
            if (demoInfo) {
                if (demoInfo.list.includes(name)) {
                    send(res, await fs.promises.readFile(req.path, 'utf-8'), 'html')
                } else if (demoInfo.templates.includes(name)) {
                    let fileContent = await fs.promises.readFile(`/src/${name}`, 'utf-8')
                    if (name == 'AppRouter.js') fileContent = fileContent.replace('{demoId}', `/${id}`)
                    send(res, fileContent, 'html')
                } else {
                    res.status(404).end()
                }
            } else {
                res.status(404).end()
            }
        } else {
            res.status(404).end()
        }
    })
    app.post('/api/get-node-modules', async (req, res) => {
        const list = await getPackageList(req.body.scopeName && __projpath('node_modules', req.body.scopeName))
        res.status(200).json({ list })
    })
    app.post('/api/get-package-json', async (req, res) => {
        if (req.body && req.body.packageName != void 0) {
            try {
                const pkgContent = await FS.promises.readFile(
                    __projpath('node_modules', req.body.packageName, 'package.json'),
                    'utf-8'
                )
                const pkg = JSON.parse(pkgContent)
                res.status(200).json({ pkg })
            } catch {
                res.status(500).end()
            }
        } else {
            res.status(500).end()
        }
    })
    app.get('/readme.md', async (req, res) => {
        send(res, await getReadmeHtml(), 'html')
    })
    app.get('/imgs/*', async (req, res) => {
        try {
            const img = await FS.promises.readFile(__projpath(req.path.replace(/^\/imgs\//, '')))
            send(res, img, 'html')
        } catch {
            res.status(404).end()
        }
    })
    app.get('*', async (req, res) => {
        let id
        if (/^\/\d+\//.test(req.path)) {
            ;[id] = /(?<=^\/)\d+(?=\/)/.exec(req.path)
        }
        if (!demoMap[id]) {
            const [redirectId] = /(?<=^\/)[^/]*/.exec(req.path)
            if (redirectId && !isNaN(Number(redirectId)) && demoMap[redirectId]) {
                res.redirect(302, `/${redirectId}/`)
            } else {
                res.redirect(302, '/readme.md')
            }
        } else {
            send(res, await getDemoHtml(id))
        }
    })
}

async function getPackageList(path) {
    path = path || __projpath('node_modules')
    let list = await FS.promises.readdir(path, {})
    for (let i = 0; i < list.length; i++) {
        let item = list[i]
        if (item.startsWith('@')) {
            let childList = await getPackageList(Path.resolve(path, item))
            list.splice(i, 1, ...childList.map(v => Path.join(item, v)))
            i += childList.length - 1
        } else if (item.startsWith('.')) {
            list.splice(i--, 1)
        }
    }
    return list
}

function send(res, content, mime = 'html') {
    res.set('cache-control', 'no-store').type(mime).status(200).send(content)
}

function sortByTemplateList(a, b) {
    const ai = templateFileList.indexOf(a)
    const bi = templateFileList.indexOf(b)
    if (ai == bi) return a.localeCompare(b)
    if (ai < 0) return 1
    if (bi < 0) return -1
    return ai - bi
}

async function getReadmeHtml() {
    let content = await fs.promises.readFile('/readme.md', 'utf-8')
    let html = await fs.promises.readFile('/template/readme.html', 'utf-8')
    const demos = `<a class="btn actived" href="/readme.md">README.md</a>${demoList
        .map(({ id, title }) => `<a class="btn" href="/${id}/">${title}</a>`)
        .join('')}`
    html = paramFormat(html, { demos, ...mdToHtml(content) })
    return html
}

async function getDemoHtml(targetId) {
    const html = await fs.promises.readFile('/template/index.html', 'utf-8')
    const { list, templates } = demoMap[targetId]
    const header = (moduleType == 'umd' && '<script src="/js/react-router-min.js"></script>') || ''
    const demos = `<a class="btn" href="/readme.md">README.md</a>${demoList
        .map(({ id, title }, i) => `<a class="btn ${id == targetId ? 'actived' : ''}" href="/${id}/">${title}</a>`)
        .join('')}`
    const files = list
        .map((v, i) => `<btn code-src="/src/${targetId}/${v}" ${i == 0 ? 'class="actived"' : ''}>${v}</btn>`)
        .join('')
    const code = await fs.promises.readFile(`/src/${targetId}/${list[0]}`, 'utf-8')
    const hiddenFiles =
        templates.length == 0
            ? ''
            : `<div><span>${templates.length}</span> hidden files</div><div id="popFiles">${templates
                  .map(v => `<btn code-src="/src/${targetId}/${v}"}>${v}</btn>`)
                  .join('')}</div>`
    return paramFormat(html, { header, demos, files, demoId: targetId, code, hiddenFiles })
}

function getDemoCode(path, fileNames = []) {
    const fileContent = FS.readFileSync(path, 'utf-8')
    const dirName = Path.basename(Path.dirname(path))
    const id = dirName == 'template' ? 0 : /^\d+(?=-)/.exec(dirName)[0]
    const highlightLines = getHighlightLine(fileContent)
    const highlightCode = getHightlightCode(fileContent)
        .split('\n')
        .map((v, i) => {
            if (/\s*\/\/\s*[^<>]+$|\/\*[^<>]+\*\//.test(v)) {
                v = v.replace(/\s*\/\/\s*[^<>]+$|\/\*[^<>]+\*\//, s =>
                    s.replace(/`[^`<>]+`/g, t => `<span class="hl-block">${t.slice(1, -1)}</span>`)
                )
            }
            if (!!id && /&#039;\.\/\w+\.js&#039;/.test(v)) {
                v = v.replace(/&#039;(\.\/(\w+\.js))&#039;/g, (s, filePath, fileName) => {
                    if (fileNames.includes(fileName)) {
                        return `&#039;<div class="btn" code-src="/src/${id}/${fileName}">${filePath}</div>&#039;`
                    }
                    return s
                })
            }
            return `<li${getLineClassName(i)}>${v}</li$>`
        })
        .join('')
    return `<ol>${highlightCode}</ol>`
    function getHighlightLine(code) {
        let lines = code.match(/(?<=@highlight\s+).+/g)
        if (!lines) return []
        return lines[0]
            .trim()
            .split(/\s+/)
            .map(v => {
                let [start, end] = v.split(/-|\+/g).map(v => Number(v))
                v.includes('+') && (end += start)
                return [start, end]
            })
    }
    function getLineClassName(n) {
        let classNames = []
        n += 1
        highlightLines.some(([s, e]) => {
            const a = n >= s && n <= e
            if (a) classNames.push('hl')
            if (n == s) classNames.push('hl-top')
            if (n == e) classNames.push('hl-bottom')
            return a
        })
        let className = classNames.join(' ')
        return className ? ` class="${className}"` : ''
    }
}

function getHightlightCode(code) {
    const ast = parse(code, {
        sourceType: 'module',
        tokens: true,
        plugins: ['jsx'],
    })
    const tokens = ast.tokens
        .map(t => ({
            type: t.type.label,
            start: t.start,
            end: t.end,
            value: t.value,
        }))
        .sort((a, b) => a.start - b.start)
    return highlight(code, tokens)
    function highlight(code, tokens) {
        let lastPos = 0
        const segments = []
        const jsxStack = []
        let before = '',
            beforeCls = ''

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i]
            if (token.start > lastPos) {
                segments.push(escapeHtml(code.slice(lastPos, token.start)))
            }
            let cls = ''
            const tokenValue = code.slice(token.start, token.end)
            if (token.type == 'jsxTagStart') {
                jsxStack.push(tokenValue == '<' ? 'open' : 'close')
                cls = 'jsx-tag'
            } else if (token.type == 'jsxText') {
                cls = 'jsx-text'
            } else if (token.type == 'jsxTagEnd') {
                jsxStack.pop()
                cls = 'jsx-tag'
            } else if (token.type == '/' && jsxStack.length > 0) {
                cls = 'jsx-tag'
            } else if (token.type == 'jsxIdentifier' && jsxStack.length > 0) {
                cls = jsxStack[jsxStack.length - 1] == 'open' ? 'jsx-tag' : 'attr'
            } else if (token.type == 'name' && ['as', 'from'].includes(token.value)) {
                cls = 'import'
            } else {
                for (const [type, keys] of Object.entries(TOKEN_TYPES)) {
                    if (keys.includes(token.type)) {
                        cls = type
                        break
                    }
                }
            }
            if (token.type == 'name') {
                if (token.value == 'async') {
                    cls = 'keyword'
                } else if (token.value == 'await') {
                    cls = 'import'
                } else if (tokens[i + 1] && tokens[i + 1].type == '(') {
                    cls = 'function'
                } else if (before == '.') {
                    cls = 'attr'
                } else if (tokens[i + 1] && tokens[i + 1].type == '.') {
                    cls = 'object'
                } else if (beforeCls == 'js-tag') {
                }
            }
            if (token.type == 'jsxName') {
                if (tokens[i + 1] && tokens[i + 1].type == '=') {
                    cls = 'jsx-attr'
                }
            }
            before = token.type
            beforeCls = cls
            const escaped = escapeHtml(tokenValue)
            const ln = escaped.startsWith('\n') ? '\n' : ''
            const rn = escaped.endsWith('\n') ? '\n' : ''
            segments.push(cls ? `${ln}<span class="${cls}">${escaped.replace(/^\n|\n$/g, '')}</span>${rn}` : escaped)
            lastPos = token.end
        }
        segments.push(escapeHtml(code.slice(lastPos)))
        return segments.join('')
    }
}
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

function mdToHtml(mdString) {
    let html = '',
        toc = {},
        isCode = false,
        lang = '',
        code = ''
    mdString.split('\n').forEach(line => {
        if (isCode) {
            if (/^\s*```\s*$/.test(line)) {
                if (lang == 'javascript') code = getHightlightCode(code)
                if (lang == 'html') code = escapeHtml(code)
                html += `<pre><code class="${lang}">${code}</code></pre>`
                isCode = false
                code = ''
            } else {
                code += `${!!code ? '\n' : ''}${line}`
            }
        } else if (line != '') {
            if (/^\s*#+ .+/.test(line)) {
                const [, h, t] = /^\s*(#+) (.+)\s*/.exec(line)
                const id = getId(t)
                html += `<h${h.length} id="${id}">${formatCode(t)}</h${h.length}>`
                const node = { id, t, list: [] }
                const pid = h.length - 1
                toc[pid] && toc[pid].list.push(node)
                toc[h.length] = node
            } else if (/\s*```.+/.test(line)) {
                isCode = true
                lang = /(?<=\s*```)[a-z]+\s*/.exec(line)[0]
                code = ''
            } else if (/^!\[[^\[\]]*\]\([^\(\)]+\)/.test(line)) {
                const [src] = /(?<=\().+(?=\))/.exec(line)
                html += `<p align="center"><img src="/imgs/${src}" width="50%"/></p>`
            } else {
                html += `<p>${formatCode(line)}</p>`
            }
        }
    })
    return { content: html, toc: `<div class="title">${toc[1].t}</div>${listToHtml(toc[1].list)}` }
    function formatCode(s) {
        return s.replace(/`([^`]+)`/g, (v, t) => `<code class="line">${escapeHtml(t)}</code>`)
    }
    function getId(str) {
        return str.replace(/\.|\s|&/g, '-').toLowerCase()
    }
    function listToHtml(list) {
        if (list.length == 0) return ''
        return `<ul>${list
            .map(v => `<li><a href="#${v.id}" id="a_${v.id}">${v.t}</a>${listToHtml(v.list)}</li>`)
            .join('')}</ul>`
    }
}

function paramFormat(str, ...arg) {
    typeof arg[0] === 'object' && (arg = arg[0] || {})
    return str.replace(/\{\s*(\w+)\s*}/g, (s, k) => arg[k] ?? s)
}

function CSI(...arg) {
    return arg
        .map(v =>
            typeof v == 'number'
                ? `\x1b[${v}m`
                : v
                      .match(/((?<=,)\d+|\d+(?=,)|\d?[A-Z])/g)
                      .map(vc => `\x1b[${vc}${/[A-Z]/.test(vc) ? '' : 'm'}`)
                      .join('')
        )
        .join('')
}
