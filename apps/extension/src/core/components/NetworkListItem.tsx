// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  Box,
  Button,
  Circle,
  HStack,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Spinner,
  Text,
  useColorMode,
  useDisclosure,
  useRadio,
  UseRadioProps,
  VStack,
} from '@chakra-ui/react';
import { secondaryHoverBgColor, secondaryButtonColor } from 'core/colors';
import { Network, defaultNetworks } from 'core/hooks/useGlobalState';
import { DeleteIcon } from '@chakra-ui/icons';
import { useNodeStatus } from 'core/queries/network';

type ConfirmationModalProps = Omit<ModalProps, 'children'> & {
  name: string,
  onConfirm: () => void,
};

function ConfirmationModal(props: ConfirmationModalProps) {
  const { name, onClose, onConfirm } = props;

  return (
    <Modal {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {`Are you sure you want to delete network ${name}?`}
        </ModalHeader>
        <ModalCloseButton />
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={onConfirm}>
            Yes
          </Button>
          <Button onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

type NetworkListItemProps = UseRadioProps & {
  network: Network,
  onRemove: (networkName: string) => void,
};

export default function NetworkListItem(props: NetworkListItemProps) {
  const {
    isChecked,
    network,
    onRemove,
  } = props;

  const queryIntervalMs = 5000;
  const queryOptions = {
    cacheTime: queryIntervalMs,
    refetchInterval: queryIntervalMs,
    staleTime: queryIntervalMs,
  };
  const {
    isLoading: isNodeStatusLoading,
    isNodeAvailable,
  } = useNodeStatus(network.nodeUrl, queryOptions);
  const isDisabled = !isNodeAvailable;

  const { getCheckboxProps, getInputProps } = useRadio({ ...props, isDisabled });
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { colorMode } = useColorMode();

  const isCustomNetwork = !(network.name in defaultNetworks);

  const onDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpen();
  };

  const enabledBoxProps = !isDisabled ? {
    _hover: {
      bg: isChecked
        ? 'teal.700'
        : secondaryHoverBgColor[colorMode],
    },
    cursor: 'pointer',
  } : {};

  return (
    <Box as="label">
      <input disabled={isDisabled} {...getInputProps()} />
      <Box
        {...getCheckboxProps()}
        {...enabledBoxProps}
        borderRadius="md"
        bgColor={secondaryButtonColor[colorMode]}
        _disabled={{
          bg: 'gray.50',
          color: 'gray.400',
        }}
        _checked={{
          bg: 'teal.600',
          color: 'white',
        }}
        _focus={{
          boxShadow: 'outline',
        }}
        px={5}
        py={3}
      >
        <HStack w="100%" justifyContent="space-between">
          <VStack alignItems="flex-start">
            <HStack>
              <Circle bg={isNodeAvailable ? 'green.300' : 'red.400'} size={2} as="span" />
              <Text fontSize="md" fontWeight={600}>
                {network.name}
              </Text>
              {
                isNodeStatusLoading
                  ? <Spinner ml={2} size="xs" as="span" />
                  : null
              }
            </HStack>
            <Text fontSize="md" fontWeight={400}>
              {network.nodeUrl}
            </Text>
          </VStack>
          {
            isCustomNetwork ? (
              <DeleteIcon
                fontSize="lg"
                cursor="pointer"
                _hover={{ color: 'red.400' }}
                onClick={onDeleteClick}
              />
            ) : null
          }
        </HStack>
      </Box>
      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={() => onRemove(network.name)}
        name={network.name}
      />
    </Box>
  );
}
