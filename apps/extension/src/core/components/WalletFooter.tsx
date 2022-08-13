// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

import {
  Center, IconButton, SimpleGrid, Text, useColorMode,
} from '@chakra-ui/react';
import { IoMdImage } from '@react-icons/all-files/io/IoMdImage';
import { RiCopperCoinFill } from '@react-icons/all-files/ri/RiCopperCoinFill';
import { RiFileListFill } from '@react-icons/all-files/ri/RiFileListFill';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { SettingsIcon } from '@chakra-ui/icons';
import Routes from 'core/routes';
import { secondaryBorderColor } from 'core/colors';
import ChakraLink from './ChakraLink';

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
      borderTopWidth="1px"
      borderTopColor={secondaryBorderColor[colorMode]}
    >
      <SimpleGrid width="100%" gap={4} columns={4}>
        <Center flexDir="column" width="100%">
          <ChakraLink display="flex" flexDir="column" alignItems="center" to={Routes.wallet.path}>
            <IconButton
              color={(pathname.includes(Routes.wallet.path))
                ? secondaryIconUnpressedColor[colorMode]
                : secondaryIconColor[colorMode]}
              variant="unstyled"
              size="md"
              aria-label="Wallet"
              fontSize="xl"
              icon={<RiCopperCoinFill size={26} />}
              display="flex"
              height="20px"
            />
            <Text
              fontWeight={600}
              color={(pathname.includes(Routes.wallet.path))
                ? secondaryIconUnpressedColor[colorMode]
                : secondaryIconColor[colorMode]}
              pt={1}
              fontSize="10px"
            >
              Home
            </Text>
          </ChakraLink>
        </Center>
        <Center flexDir="column" width="100%">
          <ChakraLink display="flex" flexDir="column" alignItems="center" to={Routes.gallery.path}>
            <IconButton
              color={(pathname.includes(Routes.gallery.path) || pathname.includes('/tokens'))
                ? secondaryIconUnpressedColor[colorMode]
                : secondaryIconColor[colorMode]}
              variant="unstyled"
              size="md"
              aria-label="Gallery"
              icon={<IoMdImage size={26} />}
              fontSize="xl"
              display="flex"
              height="20px"
            />
            <Text
              fontWeight={600}
              color={(pathname.includes(Routes.gallery.path) || pathname.includes('/tokens'))
                ? secondaryIconUnpressedColor[colorMode]
                : secondaryIconColor[colorMode]}
              pt={1}
              fontSize="10px"
            >
              Library
            </Text>
          </ChakraLink>

        </Center>
        <Center flexDir="column" width="100%">
          <ChakraLink display="flex" flexDir="column" alignItems="center" to={Routes.activity.path}>
            <IconButton
              color={(pathname.includes(Routes.activity.path))
                ? secondaryIconUnpressedColor[colorMode]
                : secondaryIconColor[colorMode]}
              variant="unstyled"
              size="md"
              aria-label="Activity"
              icon={<RiFileListFill size={26} />}
              fontSize="xl"
              display="flex"
              height="20px"
            />
            <Text
              fontWeight={600}
              color={(pathname.includes(Routes.activity.path))
                ? secondaryIconUnpressedColor[colorMode]
                : secondaryIconColor[colorMode]}
              pt={1}
              fontSize="10px"
            >
              Activity
            </Text>
          </ChakraLink>
        </Center>
        <Center flexDir="column" width="100%">
          <ChakraLink display="flex" flexDir="column" alignItems="center" to={Routes.settings.path}>
            <IconButton
              color={(pathname.includes(Routes.settings.path))
                ? secondaryIconUnpressedColor[colorMode]
                : secondaryIconColor[colorMode]}
              variant="unstyled"
              size="md"
              aria-label="Account"
              icon={<SettingsIcon fontSize={24} />}
              fontSize="xl"
              display="flex"
              height="20px"
            />
            <Text
              fontWeight={600}
              color={(pathname.includes(Routes.settings.path))
                ? secondaryIconUnpressedColor[colorMode]
                : secondaryIconColor[colorMode]}
              pt={1}
              fontSize="10px"
            >
              Settings
            </Text>
          </ChakraLink>
        </Center>
      </SimpleGrid>
    </Center>
  );
}
