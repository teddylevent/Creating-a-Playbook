import Link from 'next/link';
import { useRouter } from 'next/router';

const links = [
  { href: '/', label: 'Home' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/run-match', label: 'Run Match' },
];

export default function Navbar() {
  const router = useRouter();
  return (
    <nav className="border-b border-[#2a2a4a] bg-[#0a0a1a]/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-violet-400 tracking-widest uppercase">
          OpenClaw Arena
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                router.pathname === href
                  ? 'bg-violet-900/50 text-violet-300'
                  : 'text-gray-400 hover:text-white hover:bg-[#2a2a4a]'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
