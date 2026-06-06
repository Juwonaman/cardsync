import {useAuth} from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import PlaidLink from '../components/PlaidLink';


interface Transaction{
    transactionId: string;
    name: string;
    amount: number;
    date: string;
    category: string[];
    merchantName: string;
}



const Dashboard = () => {
    const { user, logout } = useAuth();
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [transactions, setTransaction] = useState<Transaction[]>([]);

    const fetchLinkToken = async () => {
        const response = await api.post('/api/plaid/link-token');
        setLinkToken(response.data.link_token);
    };

    const fetchTransactions = async () => {
        const response = await api.get('/api/transactions');
        setTransaction(response.data);
    };

    useEffect(() => {
        fetchLinkToken();
        fetchTransactions();
    }, []);



return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Welcome, {user?.name}</h1>
        <button onClick={logout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        {linkToken && (
          <PlaidLink
            linkToken={linkToken}
            onSuccess={fetchTransactions}
          />
        )}
      </div>

      <h2>Recent Transactions</h2>
      {transactions.length === 0 ? (
        <p style={{ color: '#666' }}>No transactions yet. Connect a bank account to get started.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
              <th style={{ textAlign: 'right', padding: '8px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
            <tr key={tx.transactionId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{tx.name}</td>
            <td style={{ padding: '8px' }}>{tx.category || 'Uncategorized'}</td>
            <td style={{ padding: '8px' }}>{tx.date}</td>
            <td style={{ padding: '8px', textAlign: 'right', color: tx.amount > 0 ? 'red' : 'green' }}>
      ${Math.abs(tx.amount).toFixed(2)}
    </td>
  </tr>
))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;