import { Box, Text, Grid, GridItem, Image, VStack, Heading, Container, useColorModeValue, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import backgroundImage from '../assets/aboutuslogo.jpg';

// Import member images
import ericImage from '../assets/Riko.jpg';

const AboutUs = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardTextColor = useColorModeValue('gray.800', 'white');
  const glowColor = useColorModeValue('teal', 'teal');

  // Sample data for team members
  const teamMembers = [
    { name: 'Eric Choge', image: ericImage, role: 'CEO', description: 'Eric Choge is the visionary CEO of GreenThumb, driving innovation and sustainable growth. With a focus on customer value and industry leadership, Eric inspires a culture of integrity and impact.' },
  ];

  const cardVariants = {
    hover: {
      scale: 1.05,
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
    },
  };

  return (
    <Box textAlign="center" p={8}>
      <Container maxW="container.lg">
        <Heading as="h1" size="2xl" mb={6}>About Us</Heading>
        <Text fontSize="lg" mb={8}>
          Welcome to GreenThumb, where we are passionate about bringing people closer to nature.
          Our journey began with a shared love for gardening, and we have grown into a community-driven platform
          dedicated to helping gardeners of all levels.
        </Text>

        <Box mb={10}>
          <Heading as="h2" size="xl" mb={4}>Our Mission</Heading>
          <Text fontSize="lg" mb={4}>
            To empower individuals to grow and care for their plants, and to connect them with a community of like-minded gardeners.
          </Text>
          <Heading as="h2" size="xl" mb={4}>Our Vision</Heading>
          <Text fontSize="lg" mb={4}>
            To be the go-to platform for all gardening enthusiasts, providing tools, knowledge, and inspiration for a greener world.
          </Text>
        </Box>

        <Heading as="h2" size="xl" mb={6}>Meet the Team</Heading>
        <Box
          position="relative"
          mb={10}
          p={10}
          bgImage={`url(${backgroundImage})`}
          bgSize="cover"
          bgPosition="center"
          borderRadius="lg"
          boxShadow="none"
          border="2px solid"
          borderColor={glowColor}
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(5px)',
            zIndex: -1,
            boxShadow: `0 0 20px ${glowColor}`,
          }}
        >
          <Grid templateColumns="repeat(1, 1fr)" gap={6} justifyItems="center">
            {teamMembers.map((member, index) => (
              <GridItem
                key={index}
                as={motion.div}
                whileHover="hover"
                variants={cardVariants}
                p={8} // Increased padding for more space
                bg={cardBg}
                color={cardTextColor}
                borderRadius="lg"
                boxShadow="md"
                textAlign="left"
                maxW="100%" // Make the card take the full available width
                position="relative"
                zIndex={0}
                border="2px solid"
                borderColor={glowColor}
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  boxShadow: `0 0 20px ${glowColor}`,
                  borderRadius: 'inherit',
                  zIndex: -1,
                }}
              >
                <Flex direction="row" align="center" justify="space-between" p={4} width="100%" minWidth="300px" minHeight="150px">
                  {/* Image Section */}
                  <Image
                    src={member.image}
                    alt={member.name}
                    borderRadius="lg"
                    width="35%" // Image takes 35% of the width
                    height="auto" // Adjust height according to content
                    objectFit="cover"
                    mr={6} // Margin to separate the image from the description
                  />
                  {/* Description Section */}
                  <VStack spacing={2} align="start" width="65%"> {/* Description takes 65% of the width */}
                    <Heading as="h3" size="lg">{member.name}</Heading>
                    <Text fontSize="md" fontWeight="bold" textAlign="center">{member.role}</Text>
                    <Text fontSize="sm">{member.description}</Text>
                  </VStack>
                </Flex>
              </GridItem>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutUs;
