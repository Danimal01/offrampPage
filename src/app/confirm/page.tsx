'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import styles from './confirm.module.css';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from '@solana/spl-token';

interface PhantomProvider {
  isPhantom: boolean;
  publicKey: PublicKey;
  connect: () => Promise<{ publicKey: PublicKey }>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (message: Uint8Array) => Promise<any>;
}

const ConfirmComponent  = () => {
  const searchParams = useSearchParams();
  const [phantomProvider, setPhantomProvider] = useState<PhantomProvider | null>(null);

  useEffect(() => {
    const provider = (window as any).solana;
    if (provider && provider.isPhantom) {
      provider.connect().then(() => {
        setPhantomProvider(provider);
      }).catch((err: any) => {
        console.error('Phantom connection failed', err);
      });
    } else {
      window.open('https://phantom.app/', '_blank');
    }
  }, []);

  const handleTransaction = async () => {
    if (!phantomProvider || !phantomProvider.publicKey) {
      console.error('Phantom provider not found or not connected');
      alert('Phantom provider not found or not connected');
      return;
    }
  
    const depositAddress = new PublicKey(searchParams.get('depositAddress') || '');
    const cryptoAmount = parseFloat(searchParams.get('cryptoAmount') || '0');
    const cryptoCurrency = searchParams.get('cryptoCurrency');
    const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/2AjX_GisadCWbv8Vd9dL0lILAOblOWSx', 'confirmed');
  
    let transaction = new Transaction();
  
    if (cryptoCurrency === 'USDC_SOL' || cryptoCurrency === 'USDT_SOL') {
      const tokenMintAddress = cryptoCurrency === 'USDC_SOL'
        ? new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
        : new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
  
      const sourceTokenAccountAddress = await getAssociatedTokenAddress(
        tokenMintAddress,
        phantomProvider.publicKey
      );
  
      const destinationTokenAccountAddress = await getAssociatedTokenAddress(
        tokenMintAddress,
        depositAddress
      );
  
      console.log('Deposit Address:', depositAddress.toBase58());
      console.log('Destination Token Account Address:', destinationTokenAccountAddress.toBase58());
      console.log('Crypto Amount:', cryptoAmount);
      console.log('Amount in smallest unit:', BigInt(Math.round(cryptoAmount * 1e6)));
  
      const sourceTokenAccountInfo = await connection.getAccountInfo(sourceTokenAccountAddress);
      if (!sourceTokenAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            phantomProvider.publicKey,
            sourceTokenAccountAddress,
            phantomProvider.publicKey,
            tokenMintAddress
          )
        );
      }
  
      const destinationTokenAccountInfo = await connection.getAccountInfo(destinationTokenAccountAddress);
      if (!destinationTokenAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            phantomProvider.publicKey,
            destinationTokenAccountAddress,
            depositAddress,
            tokenMintAddress
          )
        );
      }
  
      transaction.add(
        createTransferInstruction(
          sourceTokenAccountAddress,
          destinationTokenAccountAddress,
          phantomProvider.publicKey,
          BigInt(Math.round(cryptoAmount * 1e6)), // Assuming the token has 6 decimals
          [],
          TOKEN_PROGRAM_ID
        )
      );
    } else {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: phantomProvider.publicKey,
          toPubkey: depositAddress,
          lamports: BigInt(Math.round(cryptoAmount * 1e9)), // Convert SOL to lamports
        })
      );
    }
  
    try {
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = phantomProvider.publicKey;
  
      const signedTransaction = await phantomProvider.signTransaction(transaction);
      const serializedTransaction = signedTransaction.serialize();
      const signature = await connection.sendRawTransaction(serializedTransaction);
  
      console.log('Transaction Signature:', signature);
  
      // Retry logic for confirming the transaction
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const confirmation = await connection.confirmTransaction(signature, 'confirmed');
          if (confirmation.value.err) {
            throw new Error('Transaction failed during confirmation');
          }
          alert('Transaction successful!');
          return;
        } catch (error) {
          console.warn(`Attempt ${attempt + 1}: Transaction confirmation failed, retrying...`);
        }
      }
      throw new Error('Transaction confirmation failed after multiple attempts');
  
    } catch (error: any) {
      console.error('Transaction failed', error.message);
      alert(`Transaction failed: ${error.message}`);
    }
  };
  

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Custom Deposit Page</h1>
      <div className={styles.details}>
        <p className={styles.detailItem}><strong>Merchant ID:</strong> {searchParams.get('merchantId')}</p>
        <p className={styles.detailItem}><strong>External ID:</strong> {searchParams.get('externalId')}</p>
        <p className={styles.detailItem}><strong>Deposit Address:</strong> {searchParams.get('depositAddress')}</p>
        <p className={styles.detailItem}><strong>Region:</strong> {searchParams.get('region')}</p>
        <p className={styles.detailItem}><strong>Fiat Amount:</strong> {searchParams.get('fiatAmount')}</p>
        <p className={styles.detailItem}><strong>Fiat Currency:</strong> {searchParams.get('fiatCurrency')}</p>
        <p className={styles.detailItem}><strong>Crypto Amount:</strong> {searchParams.get('cryptoAmount')}</p>
        <p className={styles.detailItem}><strong>Crypto Currency:</strong> {searchParams.get('cryptoCurrency')}</p>
        <p className={styles.detailItem}><strong>Processing Fee:</strong> {searchParams.get('processingFee')}</p>
        <p className={styles.detailItem}><strong>Processing Fee Currency:</strong> {searchParams.get('processingFeeCurrency')}</p>
      </div>
      <button className={styles.confirmButton} onClick={handleTransaction}>Confirm Transaction</button>
    </main>
  );
};

const Confirm = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ConfirmComponent />
  </Suspense>
);

export default Confirm;
