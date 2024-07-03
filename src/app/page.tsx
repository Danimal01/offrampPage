'use client';
import styles from './page.module.css';

export default function Home() {
  const handleButtonClick = () => {
    const url = "https://offramp.gatefi.com/?merchantId=77f72e08-b9a5-47f9-9cbb-99856c8fffde&cryptoCurrency=USDC_SOL&payout=SPEI&fiatCurrency=MXN&region=MX&confirmRedirectUrl=https://offramp-page.vercel.app/confirm/";
    window.open(url, '_blank');
  };

  return (
    <main className={styles.main}>
      <div className={styles.buttonContainer}>
        <button onClick={handleButtonClick} className={styles.sellButton}>
          Sell Crypto
        </button>
      </div>
    </main>
  );
}
