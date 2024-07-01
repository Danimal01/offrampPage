// pages/index.tsx (or page.tsx if that's the file name)
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.iframeContainer}>
        <iframe
          src="https://offramp.gatefi.com/?merchantId=77f72e08-b9a5-47f9-9cbb-99856c8fffde&cryptoCurrency=USDC_SOL&payout=SPEI&fiatCurrency=MXN&region=MX&confirmRedirectUrl=http://localhost:3000/confirm/"
          className={styles.iframe}
          allowFullScreen
        ></iframe>
      </div>
    </main>
  );
}
