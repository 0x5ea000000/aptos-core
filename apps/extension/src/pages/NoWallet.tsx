// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  Box,
  VStack,
} from '@chakra-ui/react';
import WalletLayout from 'core/layouts/WalletLayout';
import AuthLayout from 'core/layouts/AuthLayout';
import { Routes as PageRoutes } from 'core/routes';
import NewExtensionBody from 'core/components/NewExtensionBody';

/**
 * First screen that is shown to the user when they download the extension
 */
function NewExtension() {
  return (
    <AuthLayout routePath={PageRoutes.noWallet.routePath}>
      <WalletLayout hasWalletFooter={false} hasWalletHeader={false}>
        <VStack width="100%" paddingTop={8}>
          <Box px={4} pb={4} width="100%">
            <NewExtensionBody />
          </Box>
        </VStack>
      </WalletLayout>
    </AuthLayout>
  );
}

export default NewExtension;
