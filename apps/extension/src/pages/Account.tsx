// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

import {
  Box,
  Divider,
  Heading,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import WalletLayout from 'core/layouts/WalletLayout';
import AuthLayout from 'core/layouts/AuthLayout';
import { Routes as PageRoutes } from 'core/routes';
import { useParams } from 'react-router-dom';
import { useCoinTransferTransactions } from 'core/queries/transaction';
import { useWalletState } from 'core/hooks/useWalletState';
import { ScriptFunctionPayload, UserTransaction } from 'aptos/dist/api/data-contracts';
import { MaybeHexString } from 'aptos';
import GraceHopperBoringAvatar from 'core/components/BoringAvatar';
import Copyable from 'core/components/Copyable';
import { collapseHexString } from 'core/utils/hex';
import TransactionList from 'core/components/TransactionList';

function filterByRecipient(recipient: MaybeHexString) {
  return (txn: UserTransaction) => {
    const payload = txn.payload as ScriptFunctionPayload;
    return (payload.arguments[0] as string) === recipient;
  };
}

function sortTxnsByVersionDescending(lhs: UserTransaction, rhs: UserTransaction) {
  return Number(rhs.version) - Number(lhs.version);
}

function useOtherAccountTransactions(theirAddress: string) {
  const { aptosAccount } = useWalletState();
  const myAddress = aptosAccount!.address().toShortString();

  // TODO: manage paging (waiting for indexer)
  const {
    data: myTxns,
    isFetching: areMyTxnsFetching,
  } = useCoinTransferTransactions({ address: myAddress });
  const {
    data: theirTxns,
    isFetching: areTheirTxnsFetching,
  } = useCoinTransferTransactions({ address: theirAddress });

  if (!myTxns || !theirTxns || areMyTxnsFetching || areTheirTxnsFetching) {
    return undefined;
  }

  const myTxnsToThem = myTxns.filter(filterByRecipient(theirAddress));
  const theirTxnsToMe = theirTxns.filter(filterByRecipient(myAddress));

  return myTxnsToThem
    .concat(theirTxnsToMe)
    .sort(sortTxnsByVersionDescending)
    .map((t) => ({ isSent: t.sender === myAddress, ...t }));
}

function Account() {
  const { address } = useParams();
  const transactions = useOtherAccountTransactions(address!);

  return (
    <AuthLayout routePath={PageRoutes.account.routePath}>
      <WalletLayout showBackButton>
        <VStack width="100%" paddingTop={8} px={4} spacing={4}>
          <Box w={20}>
            <GraceHopperBoringAvatar type="beam" />
          </Box>
          <Heading fontSize="lg" fontWeight={500} mb={8}>
            <Copyable value={address!}>
              { collapseHexString(address!, 12) }
            </Copyable>
          </Heading>

          <Divider />

          <Heading fontSize="lg">Between you</Heading>
          <TransactionList transactions={transactions} />
        </VStack>
      </WalletLayout>
    </AuthLayout>
  );
}

export default Account;
