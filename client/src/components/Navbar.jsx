import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Link,
  useColorMode,
  useColorModeValue,
  Button,
  Text,
  Collapse,
  Stack,
  useDisclosure,
  useBreakpointValue,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { FaThumbsUp } from 'react-icons/fa';

const Navbar = ({ isAuthenticated, onLogout }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure();
  const location = useLocation(); // Detect the current route
  const linkColor = useColorModeValue('black', 'white');
  const bgColor = useColorModeValue('gray.100', 'gray.900');
  const activeColor = 'teal.500'; // Color for the active route
  const hoverColor = 'teal.400'; // Hover color effect
  const logoColor = 'teal.500';
  const fontStyle = { fontFamily: 'Pacifico, cursive', fontWeight: 'bold', fontSize: '2xl' };
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    onToggle();
  };

  // Helper function for active link styling
  const getLinkStyle = (path) => ({
    color: location.pathname === path ? activeColor : linkColor,
    textDecoration: location.pathname === path ? 'underline' : 'none',
    _hover: { color: hoverColor },
  });

  return (
    <Flex
      as="nav"
      bg={bgColor}
      p={4}
      align="center"
      justify="center"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={10}
      boxShadow="md"
      width="100%"
    >
      <Flex
        align="center"
        w="full"
        maxW="1200px"
        justify="space-between"
      >
        <HStack spacing={2} mr="auto" align="center">
          <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            <HStack spacing={2} align="center">
              <Box as={FaThumbsUp} color={logoColor} boxSize="30px" />
              <Text color={logoColor} {...fontStyle}>
                GreenThumb
              </Text>
            </HStack>
          </Link>
        </HStack>

        {isDesktop ? (
          <HStack spacing={4} display={{ base: 'none', md: 'flex' }} flex="1" justify="center">
            <Link as={RouterLink} to="/home" {...getLinkStyle('/home')}>Home</Link>
            <Link as={RouterLink} to="/plants" {...getLinkStyle('/plants')}>Plants</Link>
            <Link as={RouterLink} to="/careschedule" {...getLinkStyle('/careschedule')}>Care Schedule</Link>
            <Link as={RouterLink} to="/tips" {...getLinkStyle('/tips')}>Tips</Link>
            <Link as={RouterLink} to="/forum" {...getLinkStyle('/forum')}>Forum</Link>
            <Link as={RouterLink} to="/layout" {...getLinkStyle('/layout')}>Layout</Link>
            <Link as={RouterLink} to="/about" {...getLinkStyle('/about')}>About</Link>
            <Link as={RouterLink} to="/faq" {...getLinkStyle('/faq')}>FAQs</Link>
            {isAuthenticated ? (
              <Button colorScheme="teal" onClick={onLogout}>
                Logout
              </Button>
            ) : (
              <>
                <Link as={RouterLink} to="/login" {...getLinkStyle('/login')}>Login</Link>
              </>
            )}
          </HStack>
        ) : (
          <>
            <IconButton
              ml="auto"
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              onClick={onToggle}
              variant="outline"
              aria-label="Toggle Navigation"
            />
            <Collapse in={isOpen}>
              <Stack
                spacing={4}
                p={4}
                display={{ base: 'flex', md: 'none' }}
                bg={bgColor}
                position="absolute"
                top="60px"
                left="0"
                right="0"
                borderRadius="md"
                zIndex={1}
                align="center"
              >
                <Link as={RouterLink} to="/home" {...getLinkStyle('/home')} onClick={() => handleNavigation('/home')}>Home</Link>
                <Link as={RouterLink} to="/plants" {...getLinkStyle('/plants')} onClick={() => handleNavigation('/plants')}>Plants</Link>
                <Link as={RouterLink} to="/careschedule" {...getLinkStyle('/careschedule')} onClick={() => handleNavigation('/careschedule')}>Care Schedule</Link>
                <Link as={RouterLink} to="/tips" {...getLinkStyle('/tips')} onClick={() => handleNavigation('/tips')}>Tips</Link>
                <Link as={RouterLink} to="/forum" {...getLinkStyle('/forum')} onClick={() => handleNavigation('/forum')}>Forum</Link>
                <Link as={RouterLink} to="/layout" {...getLinkStyle('/layout')} onClick={() => handleNavigation('/layout')}>Layout</Link>
                <Link as={RouterLink} to="/about" {...getLinkStyle('/about')} onClick={() => handleNavigation('/about')}>About</Link>
                <Link as={RouterLink} to="/faq" {...getLinkStyle('/faq')} onClick={() => handleNavigation('/faq')}>FAQs</Link>
                {isAuthenticated ? (
                  <Button colorScheme="teal" onClick={onLogout}>
                    Logout
                  </Button>
                ) : (
                  <>
                    <Link as={RouterLink} to="/login" {...getLinkStyle('/login')} onClick={() => handleNavigation('/login')}>Login</Link>
                  </>
                )}
              </Stack>
            </Collapse>
          </>
        )}

        <Flex align="center" ml={2}>
          <IconButton
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="outline"
            aria-label="Toggle dark mode"
            mr={2}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

// PropTypes validation
Navbar.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default Navbar;
