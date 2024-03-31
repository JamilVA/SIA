import { Metadata } from 'next';
import React from 'react';

interface SimpleLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXTAUTH_URL as string),
    title: 'Académico ESFAPMUA',
    description: 'The ultimate collection of design-agnostic, flexible and accessible React UI Components.'
};

export default function SimpleLayout({ children }: SimpleLayoutProps) {
    return (
        <React.Fragment>
            {children}
        </React.Fragment>
    );
}
