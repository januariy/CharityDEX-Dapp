import { useEffect } from 'react';
import { toast } from 'react-toastify';

import { ConnectorNotFoundError, useContractWrite } from 'wagmi';

import { CharityContractAbi, CharityContractAddress } from '../CharityContract';

const AMOUNT = 1;

export const useHydrateBuySFT = () => {
  const { writeAsync: buy } = useContractWrite({
    mode: 'recklesslyUnprepared',
    addressOrName: CharityContractAddress,
    contractInterface: CharityContractAbi,
    functionName: 'buy',
  });

  useEffect(() => {
    const handler = async () => {
      if (location.hash === '') return;

      const matchResult = location.hash.match(/#buy(\d+)/i);
      const id = Number(matchResult?.[1] ?? 0);
      try {
        if (id !== 0) {
          const buyPromise = buy({ recklesslySetUnpreparedArgs: [id, AMOUNT] });
          await toast.promise(buyPromise, {
            pending: 'Purchase is in progress',
            success: 'SFT has been bought',
            error: {
              render: ({ data }) => {
                if (/execution reverted: Not enough funds/i.test(data.message)) {
                  return "Not enough 'Save The World' tokens";
                }
                if (data instanceof ConnectorNotFoundError) {
                  return 'Connect your wallet to buy SFT';
                }
                return 'Unknown error occurred';
              },
            },
          });
        }
      } finally {
        location.hash = '';
      }
    };

    addEventListener('hashchange', handler);
    return () => removeEventListener('hashchange', handler);
  }, [buy]);
};
