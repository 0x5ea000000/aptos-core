// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

import {
  Center,
  Grid, Icon, Text, useColorMode,
} from '@chakra-ui/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { secondaryGridHoverBgColor, secondaryGridBgColor, textColor } from 'core/colors';
import useGlobalStateContext from 'core/hooks/useGlobalState';

interface BgColorDictType {
  dark: string;
  light: string;
}

export interface SettingsListItemProps {
  bgColorDict?: BgColorDictType;
  hoverBgColorDict?: BgColorDictType;
  icon: any | undefined;
  path: string;
  textColorDict?: BgColorDictType;
  title: string;
}

export default function SettingsListItem({
  bgColorDict = secondaryGridBgColor,
  hoverBgColorDict = secondaryGridHoverBgColor,
  textColorDict = textColor,
  icon,
  path,
  title,
}: SettingsListItemProps) {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const { activeAccount, removeAccount } = useGlobalStateContext();

  const gridOnClick = async () => {
    if (title === 'Sign out' && removeAccount && activeAccount) {
      // todo: add toasts for removing the account
      // we should probably combine the toasts from the wallet drawer
      await removeAccount(activeAccount.address);
    }
    navigate(path);
  };

  return (
    <Grid
      templateColumns="32px 1fr"
      p={4}
      width="100%"
      cursor="pointer"
      onClick={gridOnClick}
      gap={2}
      bgColor={bgColorDict[colorMode]}
      borderRadius=".5rem"
      _hover={{
        bgColor: hoverBgColorDict[colorMode],
      }}
    >
      <Center width="100%">
        <Icon
          fontSize="xl"
          borderColor={textColorDict[colorMode]}
          color={textColorDict[colorMode]}
          as={icon}
        />
      </Center>
      <Text color={textColorDict[colorMode]} fontWeight={600} fontSize="md">
        {title}
      </Text>
    </Grid>
  );
}
