/**
 * @highlight 13-14
 */

import { Link } from 'react-router-min'

export default function Layout({ children }) {
    return (
        <>
            <div className='header'>
                <Link
                    href='/'
                    // Importing links not created by creatRouter, pass `base` as you needed
                    options={{ base: '/1' }}
                >
                    Home
                </Link>

                <Link
                    href='/about'
                    options={{ base: '/1' }}
                >
                    About
                </Link>
            </div>
            {children}
        </>
    )
}
