interface PhantomProvider {
    isPhantom: boolean;
    publicKey: PublicKey;
    connect: () => Promise<{ publicKey: PublicKey }>;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
    signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
    signMessage: (message: Uint8Array) => Promise<any>;
  }
  
  interface Window {
    solana?: PhantomProvider;
  }
  