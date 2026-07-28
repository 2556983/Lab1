import './globals.css';

export const metadata = {
  title: 'Ledger — a local todo',
  description: 'A local-first todo application.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
