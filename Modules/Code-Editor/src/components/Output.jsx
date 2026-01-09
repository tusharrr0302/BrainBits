import { Box, Text } from '@chakra-ui/react';

export default function Output({ output }) {
  return (
    <Box
      w="100%"
      h="100%"
      bg="#1e1e1e"
      color="#cccccc"
      p={3}
      fontFamily="'Courier New', monospace"
      fontSize="13px"
      overflowY="auto"
      whiteSpace="pre-wrap"
      css={{
        '&::-webkit-scrollbar': { width: '10px' },
        '&::-webkit-scrollbar-track': { bg: '#1e1e1e' },
        '&::-webkit-scrollbar-thumb': { bg: '#424242', borderRadius: '5px' }
      }}
    >
      {output || <Text color="#6a9955" fontStyle="italic">Run your code to see output...</Text>}
    </Box>
  );
}