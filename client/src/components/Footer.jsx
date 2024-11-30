import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react';
import { FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <Box
      as="footer"
      bg={useColorModeValue('gray.100', 'gray.900')}
      color={useColorModeValue('gray.600', 'white')}
      py={4}
      width="100%"
      textAlign="center"
    >
      <Text mb={2}>&copy; {new Date().getFullYear()} GreenThumb. All rights reserved.</Text>
      <Flex justify="center" align="center" gap={4}>
        <Flex align="center" gap={2}>
          <FaPhone />
          <Text as="span">+254 706 258 077</Text>
        </Flex>
        <Flex align="center" gap={2}>
          <FaEnvelope />
          <Text>
            echoge2003@gmail.com
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Footer;
