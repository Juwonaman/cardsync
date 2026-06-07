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
        style={{
  fontSize: '13px',
  padding: '8px 16px',
  borderRadius: '7px',
  border: '1px solid #0A0A0A',
  background: '#0A0A0A',
  color: '#FFFFFF',
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
  opacity: ready ? 1 : 0.5,
}}>
            Connect Bank Account
        </button>
    );
};
export default PlaidLink;