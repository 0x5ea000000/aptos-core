// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import {
  Button,
  Center,
  Flex,
  HStack,
  IconButton,
  useColorMode,
  VStack,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

interface SimulatedExtensionContainerProps {
  children: React.ReactNode;
}

export const boxShadow = 'rgba(149, 157, 165, 0.2) 0px 0px 8px 4px';

const extensionDimensions = ['375px', '600px'];
const fullscreenDimensions = ['100vw', 'calc(100vh - 72px)'];

const secondaryFlexBgColor = {
  dark: 'gray.800',
  light: 'gray.100',
};

const secondaryHeaderBgColor = {
  dark: 'gray.700',
  light: 'white',
};

function DesktopComponent({ children }: SimulatedExtensionContainerProps) {
  const { colorMode, setColorMode } = useColorMode();
  const [
    simulatedDimensions,
    setSimulatedDimensions,
  ] = useState(extensionDimensions);

  const isFullScreen = simulatedDimensions[0] === '100vw';
  const changeDimensionsToExtension = () => setSimulatedDimensions(extensionDimensions);
  const changeDimensionsToFullscreen = () => setSimulatedDimensions(fullscreenDimensions);

  return (
    <VStack w="100vw" h="100vh" spacing={0}>
      <Flex
        flexDirection="row-reverse"
        w="100%"
        py={4}
        bgColor={secondaryHeaderBgColor[colorMode]}
      >
        <HStack spacing={4} pr={4}>
          <Button onClick={changeDimensionsToExtension}>
            Extension
          </Button>
          <Button onClick={changeDimensionsToFullscreen}>
            Full screen
          </Button>
          <IconButton
            aria-label="dark mode"
            icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
            onClick={() => setColorMode((colorMode === 'dark') ? 'light' : 'dark')}
          />
        </HStack>
      </Flex>
      <Center
        w="100%"
        h="100%"
        bgColor={secondaryFlexBgColor[colorMode]}
      >
        <Center
          maxW={simulatedDimensions[0]}
          maxH={simulatedDimensions[1]}
          w={simulatedDimensions[0]}
          h={simulatedDimensions[1]}
          borderRadius=".5rem"
          overflow="auto"
          boxShadow={isFullScreen ? undefined : boxShadow}
        >
          { children }
        </Center>
      </Center>
    </VStack>
  );
}

function ExtensionComponent({ children }: SimulatedExtensionContainerProps) {
  return (
    <VStack w="100vw" h="100vh" spacing={0}>
      { children }
    </VStack>
  );
}

export default function SimulatedExtensionContainer({
  children,
}: SimulatedExtensionContainerProps) {
  const isDevelopment = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');
  const Wrapper = isDevelopment ? DesktopComponent : ExtensionComponent;
  return (
    <Wrapper>{ children }</Wrapper>
  );
}
