// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

import { createStandaloneToast } from '@chakra-ui/react';

export const { toast } = createStandaloneToast({
  defaultOptions: {
    duration: 2000,
    isClosable: true,
    variant: 'solid',
  },
});

// Add Account
export const createAccountToast = () => {
  toast({
    description: 'Successfully created new account',
    status: 'success',
    title: 'Created account',
  });
};

export const createAccountErrorToast = () => {
  toast({
    description: 'Error creating new account',
    status: 'error',
    title: 'Error creating account',
  });
};

export const importAccountToast = () => {
  toast({
    description: 'Successfully imported new account',
    status: 'success',
    title: 'Imported account',
  });
};

export const importAccountErrorToast = () => {
  toast({
    description: 'Error importing new account',
    status: 'error',
    title: 'Error importing account',
  });
};

export const importAccountErrorAccountAlreadyExistsToast = () => {
  toast({
    description: 'Account already exists in wallet',
    status: 'error',
    title: 'Error importing account',
  });
};

export const importAccountNotFoundToast = () => {
  toast({
    description: 'Account does not exist on-chain (please note devnet is wiped every 2 weeks)',
    status: 'error',
    title: 'Error importing account',
  });
};

// Switch Account

export const switchAccountToast = (accountAddress: string) => {
  toast({
    description: `Successfully switched account to ${accountAddress.substring(0, 6)}...`,
    status: 'success',
    title: 'Switched account',
  });
};

export const switchAccountErrorToast = () => {
  toast({
    description: 'Error during account switch',
    status: 'error',
    title: 'Error switch account',
  });
};

// Remove Account

export const removeAccountToast = (message: string) => {
  toast({
    description: message,
    status: 'success',
    title: 'Deleted account',
  });
};

export const removeAccountErrorToast = () => {
  toast({
    description: 'Account deletion process incurred an error',
    status: 'error',
    title: 'Error deleting account',
  });
};

export const addNetworkToast = (networkName?: string) => {
  const description = networkName
    ? `Switching to ${networkName}`
    : 'Staying on current network';
  toast({
    description,
    status: 'success',
    title: 'Added network',
  });
};

export const switchNetworkToast = (networkName: string, isSwitching: boolean) => {
  const description = isSwitching
    ? `Switching to ${networkName}`
    : `Staying on ${networkName}`;
  toast({
    description,
    status: 'success',
    title: 'Removed network',
  });
};

export default toast;
