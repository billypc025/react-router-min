import Header from './Header.js'

export default function Layout({ router, children }) {
    return (
        <>
            <Header router={router} />
            {children}
        </>
    )
}
