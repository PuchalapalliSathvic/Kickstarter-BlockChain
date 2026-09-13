import Head from "next/head";
import Header from "./Header";

export default function Layout({ children, title = "CrowdCoin — Decentralized crowdfunding" }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Transparent crowdfunding powered by Ethereum smart contracts." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      <main>{children}</main>
      <footer className="siteFooter">
        <div className="shell footerInner">
          <p>Built on Ethereum. Every contribution and request is verifiable on-chain.</p>
          <span>© {new Date().getFullYear()} CrowdCoin</span>
        </div>
      </footer>
    </>
  );
}
