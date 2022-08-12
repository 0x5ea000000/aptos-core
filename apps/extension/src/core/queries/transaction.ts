// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

import { AptosClient } from 'aptos';
import { useQuery, UseQueryOptions } from 'react-query';
import { ScriptFunctionPayload, UserTransaction } from 'aptos/dist/generated';
import useGlobalStateContext from 'core/hooks/useGlobalState';
import { coinNamespace } from 'core/constants';

export const transactionQueryKeys = Object.freeze({
  getAccountLatestTransactionTimestamp: 'getAccountLatestTransactionTimestamp',
  getCoinTransferSimulation: 'getCoinTransferSimulation',
  getCoinTransferTransactions: 'getCoinTransferTransactions',
  getTransaction: 'getTransaction',
  getUserTransactions: 'getUserTransactions',
} as const);

/**
 * Get successful user transactions for the specified account
 */
export async function getUserTransactions(aptosClient: AptosClient, address: string) {
  const transactions = await aptosClient!.getAccountTransactions(address!, { limit: 200 });
  return transactions
    .filter((t) => t.type === 'user_transaction')
    .map((t) => t as UserTransaction)
    .filter((t) => t.success);
}

export async function getScriptFunctionTransactions(
  aptosClient: AptosClient,
  address: string,
  functionName: string,
) {
  const transactions = await getUserTransactions(aptosClient, address);
  return transactions
    .filter((t) => t.payload.type === 'script_function_payload'
      && (t.payload as ScriptFunctionPayload).function === functionName);
}

// region Use transactions

export function useUserTransactions(
  address: string | undefined,
  options?: UseQueryOptions<UserTransaction[]>,
) {
  const { aptosClient } = useGlobalStateContext();

  return useQuery<UserTransaction[]>(
    [transactionQueryKeys.getUserTransactions, address],
    async () => getUserTransactions(aptosClient!, address!),
    {
      ...options,
      enabled: Boolean(aptosClient && address) && options?.enabled,
    },
  );
}

export function useCoinTransferTransactions(
  address: string | undefined,
  options?: UseQueryOptions<UserTransaction[]>,
) {
  const { aptosClient } = useGlobalStateContext();

  return useQuery<UserTransaction[]>(
    [transactionQueryKeys.getCoinTransferTransactions, address],
    async () => getScriptFunctionTransactions(
      aptosClient!,
      address!,
      `${coinNamespace}::transfer`,
    ),
    {
      ...options,
      enabled: Boolean(aptosClient && address) && options?.enabled,
    },
  );
}

// endregion

export const useTransaction = (
  version: number | undefined,
  options?: UseQueryOptions<UserTransaction>,
) => {
  const { aptosClient } = useGlobalStateContext();

  return useQuery<UserTransaction>(
    [transactionQueryKeys.getTransaction, version],
    async () => aptosClient!.getTransactionByVersion(BigInt(version!)) as Promise<UserTransaction>,
    {
      ...options,
      enabled: Boolean(aptosClient && version) && options?.enabled,
    },
  );
};

export function useAccountLatestTransactionTimestamp(
  address?: string,
  options?: UseQueryOptions<Date | undefined>,
) {
  const { aptosClient } = useGlobalStateContext();

  return useQuery<Date | undefined>(
    [
      transactionQueryKeys.getAccountLatestTransactionTimestamp,
      address,
    ],
    async () => {
      const txns = await aptosClient!.getAccountTransactions(address!, { limit: 1 });
      const latestTxn = (txns as UserTransaction[]).pop();
      return latestTxn && new Date(Number(latestTxn?.timestamp) / 1000);
    },
    {
      ...options,
      enabled: Boolean(address) && options?.enabled,
    },
  );
}
