import { Metadata } from 'next';
import Layout from '../../../layout/layout';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXTAUTH_URL as string),
    title: 'Académico ESFAPMUA',
    description: 'The ultimate collection of design-agnostic, flexible and accessible React UI Components.',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'Académico ESFAPMUA-REACT',
        url: 'https://sakai.primereact.org/',
        description: 'The ultimate collection of design-agnostic, flexible and accessible React UI Components.',
        images: ['https://www.primefaces.org/static/social/sakai-react.png'],
        ttl: 604800
    },
    icons: {
        icon: '/logo.ico'
    }
};

export default function AppLayout({ children }: AppLayoutProps) {
    return <Layout>{children}</Layout>;
}
