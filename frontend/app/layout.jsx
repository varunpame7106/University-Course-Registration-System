import './globals.css';
import { Toaster } from 'react-hot-toast';
import Providers from './providers';

export const metadata = {
  title: 'UCRS — University Course Registration System',
  description: 'Manage university courses, faculty, and student enrolments with role-based access control.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scrollbar-hide">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased text-primary-900 bg-background selection:bg-accent/30 selection:text-accent">
        <Providers>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 4000,
              className: 'glass border-none shadow-modal font-sans font-medium text-sm px-6 py-3 rounded-2xl',
              success: {
                iconTheme: { primary: '#10B981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#fff' },
              }
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
