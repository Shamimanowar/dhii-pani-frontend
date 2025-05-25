import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import '../css/page-header.css';

const navLinks = [
  { href: '/data-table', label: 'Data Table' },
  { href: '/graphical-dashboard', label: 'Graphical Dashboard' },
  { href: '/summary-dashboard', label: 'Summary Dashboard' },
];

export default function PageHeader({ title }) {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState('');
  const [factory, setFactory] = useState('');

  useEffect(() => {
    setCurrentPath(router.pathname);
    // Retrieve 'factory' from cookie (client-side, since httpOnly cookies are not accessible directly)
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )factory=([^;]*)/);
      if (match) setFactory(decodeURIComponent(match[1]));
    }
  }, [router.pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/login", { method: "DELETE" }); // Call API to remove token
      router.push("/login"); // Redirect to login page after logout
    } catch (err) {
      setError("Logout failed.");
    }
  };


  return (
    <header className="ph-header-outer">
      <div className="ph-header">
        <span className="ph-title">{title}</span>
        {factory && (
          <span className="ph-factory" style={{fontWeight: 600, color: '#4f3ca7'}}>{factory}</span>
        )}
        <button className="ph-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <nav className="ph-nav">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`ph-nav-link${currentPath === link.href ? ' active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}