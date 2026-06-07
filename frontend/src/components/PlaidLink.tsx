import { useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import api from '../api/axios'


interface Props {
    linkToken: string;
    onSuccess: () => void;

}

const PlaidLink = ({ linkToken, onSuccess }: Props) => {
    const onPlaidSuccess = useCallback(async (publicToken: string, metadata: any) => {
    await api.post('/api/plaid/exchange-token', {
      public_token: publicToken,
      institution_name: metadata.institution.name
    });
    await api.post('/api/transactions/sync');
    onSuccess();
  }, [onSuccess]);

    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: onPlaidSuccess,
    });

    return (
        <button onClick={() => open()}
        disabled={!ready}
        style = {{
            padding: '10px 20px',
            background: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
        }}>
            Connect Bank Account
        </button>
    );
};
export default PlaidLink;