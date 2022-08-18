// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

import React, {StrictMode, useEffect, useState} from 'react';
import { createRoot } from 'react-dom/client';
import {
  Heading,
  Center,
  Box,
  Text,
  Button,
  SimpleGrid,
  extendTheme,
  ChakraProvider,
  VStack,
  StackDivider,
  HStack,
  Image,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { Permission, PromptMessage } from 'core/types/dappTypes';
import { GlobalStateProvider, useGlobalStateContext } from "core/hooks/useGlobalState";
import Password from 'pages/Password';
import { AptosBlackLogo } from 'core/components/AptosLogo';

const theme = extendTheme({
  initialColorMode: 'light',
  styles: {
    global: {
      'html, body': {
        margin: 0,
        padding: 0,
      },
    },
  },
  useSystemColorMode: false,
});

function PermissionsPrompt({ domain, imageURI, title, permission }) {
  const onApprove = async (data, event) => {
    event?.preventDefault();
    await chrome.runtime.sendMessage(PromptMessage.APPROVED);
    window.close();
  };

  const onCancel = async (data, event) => {
    event?.preventDefault();
    await chrome.runtime.sendMessage(PromptMessage.REJECTED);
    window.close();
  };

  const permissions = [];
  switch (permission) {
    case Permission.CONNECT:
      permissions.push('View your account address');
      permissions.push('Request your approval for transactions');
      break;
    case Permission.SIGN_AND_SUBMIT_TRANSACTION:
    case Permission.SIGN_TRANSACTION:
      permissions.push('Sign a transaction');
      break;
    case Permission.SIGN_MESSAGE:
      permissions.push('Sign a message');
  }


  return (
    <VStack
      divider={<StackDivider borderColor="gray.200" />}
      height="100vh"
      spacing={4}
      padding={4}
      alignItems="stretch"
      width="100%"
      maxW="100%"
    >
      <VStack alignItems="center" width="100%" maxW="100%">
        { imageURI ? (
          <Image
            borderRadius="full"
            boxSize="200px"
            padding={4}
            src={imageURI}
          />
        ) : null}
        {title ? (
          <Heading noOfLines={1} fontSize="3xl" wordBreak="break-word">{title}</Heading>
        ) : null}
        {domain ? (
          <Text noOfLines={1} fontSize="sm" color="gray.500" wordBreak="break-word">{domain}</Text>
        ) : null}
      </VStack>
      <VStack flexGrow={1} alignItems="flex-start" width="100%" maxW="100%">
        <Text fontSize="md" color="gray.500" wordBreak="break-word">
          This app would like to:
        </Text>
        {permissions.map((permission) => (
          <HStack key={permission}>
            <InfoIcon w={4} h={4} />
            <Text fontSize="sm" wordBreak="break-word">
              {permission}
            </Text>
          </HStack>
        ))}
      </VStack>
      <SimpleGrid flex={0} spacing={4} width="100%" columns={2}>
        <Button onClick={onCancel} >
          Cancel
        </Button>
        <Button colorScheme="teal" onClick={onApprove}>
          Approve
        </Button>
      </SimpleGrid>
    </VStack>
  );
}

function PromptState() {
  const [promptInfo, setPromptInfo] = useState(undefined);
  const { areAccountsReady, areAccountsUnlocked } = useGlobalStateContext();

  useEffect(() => {
    chrome.runtime.sendMessage(PromptMessage.LOADED, (response) => {
      setPromptInfo(response);
    });
  }, []);

  if (!areAccountsReady || !promptInfo) {
    return null;
  }

  const {
    domain, imageURI, promptType, title,
  } = promptInfo;
  switch (promptType.kind) {
    case "permission":
      if (areAccountsUnlocked) {
        return PermissionsPrompt( { domain, imageURI, title, permission: promptType.permission } ); 
      } else {
        return (
          <VStack w="100vw" h="100vh">
            <Password/>
          </VStack>
        );
      }
    case "warning":
      return (
        <VStack 
          w="100vw" 
          h="100vh" 
          alignItems="center" 
          justifyContent="center"
          padding={8}
        >
            <Center>
              <Box width="75px">
                <AptosBlackLogo />
              </Box>
            </Center>
            <Heading textAlign="center">Petra</Heading>
            <Text
              textAlign="center"
              pb={8}
              fontSize="lg"
            >
              Please open the extension and create an account.
            </Text>
        </VStack>
      )
    default:
      return null;
  }
}

const root = createRoot(document.getElementById('prompt'));
root.render(
  <ChakraProvider theme={theme}>
    <StrictMode>
      <GlobalStateProvider>
        <PromptState />
      </GlobalStateProvider>
    </StrictMode>
  </ChakraProvider>,
);
