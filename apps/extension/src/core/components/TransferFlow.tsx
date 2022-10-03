// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

import {
  Button,
} from '@chakra-ui/react';
import { IoIosSend } from '@react-icons/all-files/io/IoIosSend';
import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useQueryClient } from 'react-query';
import { transferAptFormId, TransferFlowProvider, useTransferFlow } from 'core/hooks/useTransferFlow';
import {
  useCoinTransferTransaction,
} from 'core/mutations/transaction';
import queryKeys from 'core/queries/queryKeys';
import { coinTransferAbortToast, coinTransferSuccessToast, transactionErrorToast } from './Toast';
import TransferDrawer from './TransferDrawer';

function TransferButton() {
  const { coinBalanceOcta, openDrawer } = useTransferFlow();
  return (
    <Button
      disabled={!coinBalanceOcta}
      leftIcon={<IoIosSend />}
      onClick={openDrawer}
      backgroundColor="whiteAlpha.200"
      _hover={{
        backgroundColor: 'whiteAlpha.300',
      }}
      _active={{
        backgroundColor: 'whiteAlpha.400',
      }}
      color="white"
    >
      Send
    </Button>
  );
}

export interface CoinTransferFormData {
  amount?: string;
  recipient?: string;
}

function TransferFlow() {
  const {
    amountApt,
    amountOcta,
    backOnClick,
    canSubmitForm,
    closeDrawer,
    doesRecipientAccountExist,
    estimatedGasFee,
    formMethods,
    validRecipientAddress,
  } = useTransferFlow();
  const queryClient = useQueryClient();

  const { handleSubmit, reset: resetForm } = formMethods;

  const {
    mutateAsync: submitCoinTransfer,
  } = useCoinTransferTransaction({ estimatedGasFee });

  const onSubmit: SubmitHandler<CoinTransferFormData> = async (data, event) => {
    event?.preventDefault();
    if (!canSubmitForm) {
      return;
    }

    try {
      const onChainTxn = await submitCoinTransfer({
        amount: amountOcta,
        doesRecipientExist: doesRecipientAccountExist!,
        recipient: validRecipientAddress!,
      });

      if (onChainTxn.success) {
        coinTransferSuccessToast(amountApt, onChainTxn);
        resetForm();
        backOnClick();
        closeDrawer();
      } else {
        coinTransferAbortToast(onChainTxn);
      }
    } catch (err) {
      transactionErrorToast(err);
    }

    // Other queries depend on this, so this needs to complete invalidating
    // before invalidating other queries
    await queryClient.invalidateQueries(queryKeys.getAccountResources);
    Promise.all([
      queryClient.invalidateQueries(queryKeys.getAccountOctaCoinBalance),
      queryClient.invalidateQueries(queryKeys.getAccountCoinResources),
      queryClient.invalidateQueries(queryKeys.getActivity),
    ]);
  };

  return (
    <>
      <TransferButton />
      <form id={transferAptFormId} onSubmit={handleSubmit(onSubmit)}>
        <TransferDrawer />
      </form>
    </>
  );
}

export default function TransferFlowWrapper() {
  return (
    <TransferFlowProvider>
      <TransferFlow />
    </TransferFlowProvider>
  );
}
