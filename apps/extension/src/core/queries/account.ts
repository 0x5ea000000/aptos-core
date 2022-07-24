// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

import {
  AptosClient, MaybeHexString, Types,
} from 'aptos';
import useWalletState from 'core/hooks/useWalletState';
import { AptosAccountState } from 'core/types/stateTypes';
import { AptosNetwork } from 'core/utils/network';
import { useCallback } from 'react';
import { useQuery } from 'react-query';

export interface GetAccountResourcesProps {
  address?: MaybeHexString;
  nodeUrl: string;
}

export const getAccountResources = async ({
  address,
  nodeUrl,
}: GetAccountResourcesProps) => {
  const client = new AptosClient(nodeUrl);
  return (address) ? (client.getAccountResources(address)) : undefined;
};

export const getAccountBalanceFromAccountResources = (
  accountResources: Types.AccountResource[] | undefined,
): Number => {
  if (accountResources) {
    const accountResource = (accountResources) ? accountResources?.find((r) => r.type === '0x1::coin::CoinStore<0x1::test_coin::TestCoin>') : undefined;
    const tokenBalance = (accountResource)
      ? (accountResource.data as { coin: { value: string } }).coin.value
      : undefined;
    return Number(tokenBalance);
  }
  return -1;
};

export interface GetResourceFromAccountResources {
  accountResources: Types.AccountResource[] | undefined;
  resource: string
}

export const getResourceFromAccountResources = ({
  accountResources,
  resource,
}: GetResourceFromAccountResources) => ((accountResources)
  ? accountResources?.find((r) => r.type === resource)
  : undefined);

export type GetTestCoinTokenBalanceFromAccountResourcesProps = Omit<GetResourceFromAccountResources, 'resource'>;

export const getTestCoinTokenBalanceFromAccountResources = ({
  accountResources,
}: GetTestCoinTokenBalanceFromAccountResourcesProps) => {
  const testCoinResource = getResourceFromAccountResources({
    accountResources,
    resource: '0x1::coin::CoinStore<0x1::test_coin::TestCoin>',
  });
  const tokenBalance = (testCoinResource)
    ? (testCoinResource.data as { coin: { value: string } }).coin.value
    : undefined;
  return tokenBalance;
};

export const getAccountExists = async ({
  address,
  nodeUrl,
}: GetAccountResourcesProps) => {
  const client = new AptosClient(nodeUrl);
  try {
    if (address) {
      const account = await client.getAccount(address);
      return !!(account);
    }
  } catch (err) {
    return false;
  }
  return false;
};

interface GetToAddressAccountExistsProps {
  queryKey: (string | {
    aptosAccount: AptosAccountState;
    nodeUrl: AptosNetwork;
    toAddress?: MaybeHexString | null;
  })[]
}

export const accountQueryKeys = Object.freeze({
  getAccountExists: 'getAccountExists',
  getAccountResources: 'getAccountResources',
} as const);

export const getToAddressAccountExists = async (
  { queryKey }: GetToAddressAccountExistsProps,
) => {
  const [, paramsObject] = queryKey;
  if (typeof paramsObject === 'string') return false;
  const { aptosAccount, nodeUrl, toAddress } = paramsObject;
  if (toAddress && aptosAccount) {
    const doesAccountExist = await getAccountExists({ address: toAddress, nodeUrl });
    return doesAccountExist;
  }
  return false;
};

interface UseAccountExistsProps {
  address: MaybeHexString;
  // miliseconds
  debounceTimeout?: number;
}

export const useAccountExists = ({
  address,
}: UseAccountExistsProps) => {
  const { aptosNetwork } = useWalletState();

  const getAccountExistsQuery = useCallback(async () => {
    const accountExists = await getAccountExists({ address, nodeUrl: aptosNetwork });
    return accountExists;
  }, [address, aptosNetwork]);

  // fires query everytime address changes
  return useQuery([accountQueryKeys.getAccountExists, address], getAccountExistsQuery);
};

interface UseAccountResourcesProps {
  address?: string;
  refetchInterval?: number | false
}

export const useAccountResources = (props?: UseAccountResourcesProps) => {
  const { aptosAccount, aptosNetwork } = useWalletState();

  return useQuery(
    [
      accountQueryKeys.getAccountResources,
      props?.address,
    ],
    () => getAccountResources({
      address: props?.address || aptosAccount?.address(),
      nodeUrl: aptosNetwork,
    }),
    { refetchInterval: props?.refetchInterval || 2000 },
  );
};
