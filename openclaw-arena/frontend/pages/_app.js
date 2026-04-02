import '../styles/globals.css';
import Navbar from '../components/Navbar';

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
