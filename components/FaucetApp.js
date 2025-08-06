import { useState } from 'react';
import { ethers } from 'ethers';

export default function FaucetApp() {
  const [walletAddresses, setWalletAddresses] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [faucetBalance, setFaucetBalance] = useState('');
  const [history, setHistory] = useState([]);

  const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/base');
  const faucetPrivateKey = '<0xc37bb6ee6cc890ee8180aaef68e016a7fa144cb42596995a16160ff26ce076c7>'; // Replace with your faucet wallet private key
  const signer = new ethers.Wallet(faucetPrivateKey, provider);

  const checkFaucetBalance = async () => {
    try {
      const balance = await provider.getBalance(signer.address);
      setFaucetBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error(error);
      setFaucetBalance('Error fetching balance');
    }
  };

  const handleFaucet = async () => {
    try {
      setStatus('Sending...');
      const addresses = walletAddresses.split(',').map(addr => addr.trim());
      const newHistory = [...history];

      for (const address of addresses) {

        const tx = await signer.sendTransaction({
          to: address,
          value: ethers.utils.parseEther(amount),
        });

        await tx.wait();
        console.log('Transaction successful:', tx.hash);

        newHistory.push({
          address: address,
          amount: amount,
          txHash: tx.hash
        });
      }

      setHistory(newHistory);
      setStatus('All Transactions Successful');
      checkFaucetBalance();
    } catch (error) {
      console.error(error);
      setStatus('Transaction Failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Base Mainnet Faucet</h1>

      <div className="w-full max-w-md mb-6">
        <textarea
          placeholder="Enter Wallet Addresses (comma separated)"
          value={walletAddresses}
          onChange={(e) => setWalletAddresses(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          placeholder="Amount (ETH)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <button onClick={handleFaucet} className="w-full mb-3 px-4 py-2 bg-blue-600 text-white rounded">Send</button>
        <button onClick={checkFaucetBalance} className="w-full px-4 py-2 bg-green-600 text-white rounded">Check Faucet Balance</button>
        {status && <p className="mt-3 text-sm text-center">{status}</p>}
        {faucetBalance && <p className="mt-1 text-sm text-center">Faucet Balance: {faucetBalance} ETH</p>}
      </div>

      {history.length > 0 && (

        <div className="w-full max-w-md">

          <h2 className="text-xl font-semibold mb-2">Transaction History</h2>

          <ul className="text-sm">

            {history.map((item, index) => (

              <li key={index} className="mb-2 p-2 border rounded bg-white">

                <p><strong>Address:</strong> {item.address}</p>

                <p><strong>Amount:</strong> {item.amount} ETH</p>

                <p><strong>Tx Hash:</strong> <a href={`https://basescan.org/tx/${item.txHash}`} target="_blank" className="text-blue-600">{item.txHash.slice(0, 10)}...</a></p>

              </li>

            ))}

          </ul>

        </div>

      )}

    </div>
  );
}
