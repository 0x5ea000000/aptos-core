// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';
import { Box, Grid, useColorMode } from '@chakra-ui/react';
import WalletFooter from 'core/components/WalletFooter';
import WalletHeader from 'core/components/WalletHeader';
import { secondaryBgColor } from 'core/colors';

interface WalletLayoutProps {
  backPage?: string;
  children: React.ReactNode;
  hasWalletFooter?: boolean;
  hasWalletHeader?: boolean;
}

export default function WalletLayout({
  backPage,
  children,
  hasWalletFooter = true,
  hasWalletHeader = true,
}: WalletLayoutProps) {
  const { colorMode } = useColorMode();

  const templateRows = useMemo(() => {
    if (hasWalletFooter && hasWalletHeader) {
      return '64px 1fr 40px';
    }
    if (hasWalletFooter) {
      return '1fr 40px';
    }
    if (hasWalletHeader) {
      return '64px 1fr';
    }
    return '1fr';
  }, [hasWalletHeader, hasWalletFooter]);

  return (
    <Grid
      height="100%"
      width="100%"
      maxW="100%"
      templateRows={templateRows}
      bgColor={secondaryBgColor[colorMode]}
    >
      {hasWalletHeader ? (
        <WalletHeader backPage={backPage} />
      ) : undefined}
      <Box maxH="100%" overflowY="auto" pb={4}>
        {children}
      </Box>
      {hasWalletFooter ? (
        <WalletFooter />
      ) : undefined}
    </Grid>
  );
}
