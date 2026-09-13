import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Icon from "./Icon";
import WalletButton from "./WalletButton";

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const exploreActive = router.pathname === "/" || router.pathname.startsWith("/campaigns/[address]");
  const createActive = router.pathname === "/campaigns/new";

  return (
    <header className="siteHeader">
      <div className="shell navInner">
        <Link href="/" className="brand" aria-label="Crowd Coin home">
          <span className="brandMark"><Icon name="ethereum" size={22} /></span>
          <span>Crowd<span>Coin</span></span>
        </Link>

        <nav className={`navLinks ${open ? "open" : ""}`}>
          <Link href="/" className={exploreActive ? "active" : ""} onClick={() => setOpen(false)}>Explore</Link>
          <Link href="/campaigns/new" className={createActive ? "active" : ""} onClick={() => setOpen(false)}>Create campaign</Link>
          <div className="mobileWallet"><WalletButton /></div>
        </nav>

        <div className="navActions">
          <WalletButton />
          <button className="menuButton" type="button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
            <Icon name="menu" size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}
