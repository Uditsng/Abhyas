'use client'

import { Box, Flex, Text, Icon } from '@chakra-ui/react';
import { FiArrowUp, FiArrowDown} from 'react-icons/fi';

export default function TrendIndicator({value, timeframe="vs last week", inverted= false}){

    const isPositive = inverted ? value < 0 : value > 0;

    const color = isPositive ? 'green.500' : 'red.500';
    const TrendIcon = isPositive ? FiArrowUp : FiArrowDown;

    return(
        <Flex alignItems="center" mt={1}>
            <Box
              bg={isPositive ? "green.100" : "red.100"}
              color={color}
              borderRadius="full"
              p={1}
              mr={2}
              >
                <Icon as={TrendIcon} boxSize={3} />
            </Box>
            <Text fontSize="sm" color={color} fontWeight="medium">
                {Math.abs(value)}%
            </Text>
            <Text fontSize="sm" color="gray.500" ml={1}>
                {timeframe}
            </Text>
        </Flex>
    )
}