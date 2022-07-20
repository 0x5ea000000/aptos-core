// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

import {
  Box,
  Button,
  Flex,
  Heading,
  Tag,
  Text,
  Tooltip,
  useClipboard,
  useColorMode,
  VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import useWalletState from 'core/hooks/useWalletState';
import ChakraLink from 'core/components/ChakraLink';
import CreateWalletHeader from 'core/components/CreateWalletHeader';
import withSimulatedExtensionContainer from 'core/components/WithSimulatedExtensionContainer';
import { createNewAccount } from 'core/utils/account';
import { secondaryBgColor } from 'core/colors';
import { ChevronRightIcon } from '@chakra-ui/icons';
import AuthLayout from 'core/layouts/AuthLayout';
import { Routes as PageRoutes } from 'core/routes';
import Analytics from 'core/utils/analytics/analytics';
import { createAccountEvents } from 'core/utils/analytics/events';

export interface CredentialHeaderAndBodyProps {
  body?: string;
  header: string;
}

export function CredentialHeaderAndBody({
  body,
  header,
}: CredentialHeaderAndBodyProps) {
  const { hasCopied, onCopy } = useClipboard(body || '');
  return (
    <VStack spacing={2} maxW="100%" alignItems="flex-start">
      <Tag>
        {header}
      </Tag>
      <Tooltip label={hasCopied ? 'Copied!' : 'Copy'} closeDelay={300}>
        <Text fontSize="sm" cursor="pointer" wordBreak="break-word" onClick={onCopy}>
          {body}
        </Text>
      </Tooltip>
    </VStack>
  );
}

function NewAccountState() {
  const [isAccountBeingCreated, setIsAccountBeingCreated] = useState<boolean>(false);
  const {
    addAccount, aptosAccount,
  } = useWalletState();
  const privateKeyObject = aptosAccount?.toPrivateKeyObject();
  const privateKeyHex = privateKeyObject?.privateKeyHex;
  const publicKeyHex = privateKeyObject?.publicKeyHex;
  const address = privateKeyObject?.address;

  const createAccountOnClick = async () => {
    setIsAccountBeingCreated(true);
    const account = createNewAccount();
    Analytics.event({ eventType: createAccountEvents.CREATE_ACCOUNT });
    await addAccount({ account });
    setIsAccountBeingCreated(false);
  };

  return (
    <Box px={4} pb={4}>
      <Box maxW="100%">
        {
          (!aptosAccount)
            ? (
              <>
                <Heading fontSize="xl" pb={4}>New account</Heading>
                <Text fontSize="sm" maxW="100%" wordBreak="break-word">
                  If you do not have a wallet account, you can create a private
                  / public key account by clicking the button below
                </Text>
                <Box pt={4}>
                  <Button isLoading={isAccountBeingCreated} size="sm" colorScheme="teal" onClick={createAccountOnClick}>
                    Create Account
                  </Button>
                </Box>
              </>
            )
            : (
              <>
                <Heading fontSize="xl" pb={4}>Account credentials</Heading>
                <Text fontSize="sm" maxW="100%" wordBreak="break-word">
                  Please DO NOT lose these credentials,
                  and do not give your private key out to others.
                </Text>
                <VStack mt={4} spacing={4} alignItems="flex-start">
                  <CredentialHeaderAndBody
                    header="Private key"
                    body={privateKeyHex}
                  />
                  <CredentialHeaderAndBody
                    header="Public key"
                    body={publicKeyHex}
                  />
                  <CredentialHeaderAndBody
                    header="Address"
                    body={address}
                  />
                </VStack>
                <Flex width="100%" pt={12}>
                  <ChakraLink to="/">
                    <Button colorScheme="teal" size="md" rightIcon={<ChevronRightIcon />}>
                      Proceed to wallet
                    </Button>
                  </ChakraLink>
                </Flex>
              </>
            )
        }
      </Box>
    </Box>
  );
}

function CreateWallet() {
  const { colorMode } = useColorMode();

  return (
    <AuthLayout routePath={PageRoutes.createWallet.routePath}>
      <VStack
        bgColor={secondaryBgColor[colorMode]}
        spacing={4}
        width="100%"
        height="100%"
      >
        <CreateWalletHeader />
        <VStack width="100%" pt={4}>
          <NewAccountState />
        </VStack>
      </VStack>
    </AuthLayout>
  );
}

export default withSimulatedExtensionContainer({
  Component: CreateWallet,
});
