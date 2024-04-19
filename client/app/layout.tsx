'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import SessionAutProvider from '../context/SessionAuthProvider';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/badges.scss';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="es" suppressHydrationWarning>
            <head>
                <link id="theme-css" href={`/css/theme.css`} rel="stylesheet"></link>
                <title>Académico ESFAPMUA</title>
            </head>
            <body>
                <SessionAutProvider>
                    <PrimeReactProvider>
                        <LayoutProvider>{children}</LayoutProvider>
                    </PrimeReactProvider>
                </SessionAutProvider>
            </body>
        </html>
    );
}
