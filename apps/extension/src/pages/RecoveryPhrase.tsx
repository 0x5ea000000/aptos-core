// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  Heading,
  VStack,
} from '@chakra-ui/react';
import WalletLayout from 'core/layouts/WalletLayout';
import AuthLayout from 'core/layouts/AuthLayout';
import { Routes as PageRoutes } from 'core/routes';
import RecoveryPhraseBox from 'core/components/RecoveryPhraseBox';

function RecoveryPhrase() {
  return (
    <AuthLayout routePath={PageRoutes.recovery_phrase.routePath}>
      <WalletLayout backPage="/settings">
        <VStack width="100%" height="100%" spacing={8} paddingTop={8} paddingStart={8} paddingEnd={8}>
          <Heading fontSize="2xl">Recovery Phrase</Heading>
          <RecoveryPhraseBox />
        </VStack>
      </WalletLayout>
    </AuthLayout>
  );
}

export default RecoveryPhrase;
