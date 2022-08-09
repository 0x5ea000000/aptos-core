// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

import {
  Center, IconButton, SimpleGrid, useColorMode,
} from '@chakra-ui/react';
import { IoMdImage } from '@react-icons/all-files/io/IoMdImage';
import { RiCopperCoinFill } from '@react-icons/all-files/ri/RiCopperCoinFill';
import { RiFileListFill } from '@react-icons/all-files/ri/RiFileListFill';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { SettingsIcon } from '@chakra-ui/icons';
import Routes from 'core/routes';
import ChakraLink from './ChakraLink';

const secondaryFooterBgColor = {
  dark: 'gray.700',
  light: 'gray.100',
};

const secondaryIconColor = {
  dark: 'whiteAlpha.500',
  light: 'blackAlpha.500',
};

const secondaryIconUnpressedColor = {
  dark: 'blue.400',
  light: 'blue.400',
};

export default function WalletFooter() {
  const { colorMode } = useColorMode();
  const { pathname } = useLocation();

  return (
    <Center
      maxW="100%"
      width="100%"
      bgColor={secondaryFooterBgColor[colorMode]}
    >
      <SimpleGrid width="100%" gap={4} columns={4}>
        <Center width="100%">
          <ChakraLink to={Routes.wallet.routePath}>
            <IconButton
              color={(pathname.includes(Routes.wallet.routePath))
                ? secondaryIconUnpressedColor[colorMode]
                : secondaryIconColor[colorMode]}
              variant="unstyled"
              size="md"
              aria-label="Wallet"
              fontSize="xl"
              icon={<RiCopperCoinFill />}
              display="flex"
            />
          </ChakraLink>
        </Center>
        <Center width="100%">
          <ChakraLink to={Routes.gallery.routePath}>
            <IconButton
              color={(pathname.includes(Routes.gallery.routePath) || pathname.includes('/tokens'))
                ? secondaryIconUnpressedColor[colorMode]
                : secondaryIconColor[colorMode]}
              variant="unstyled"
              size="md"
              aria-label="Gallery"
              icon={<IoMdImage />}
              fontSize="xl"
              display="flex"
            />
          </ChakraLink>
        </Center>
        <Center width="100%">
          <ChakraLink to={Routes.activity.routePath}>
            <IconButton
              color={(pathname.includes(Routes.activity.routePath))
                ? secondaryIconUnpressedColor[colorMode]
                : secondaryIconColor[colorMode]}
              variant="unstyled"
              size="md"
              aria-label="Activity"
              icon={<RiFileListFill />}
              fontSize="xl"
              display="flex"
            />
          </ChakraLink>
        </Center>
        <Center width="100%">
          <ChakraLink to={Routes.settings.routePath}>
            <IconButton
              color={(pathname.includes(Routes.settings.routePath))
                ? secondaryIconUnpressedColor[colorMode]
                : secondaryIconColor[colorMode]}
              variant="unstyled"
              size="md"
              aria-label="Account"
              icon={<SettingsIcon />}
              fontSize="xl"
              display="flex"
            />
          </ChakraLink>
        </Center>
      </SimpleGrid>
    </Center>
  );
}
