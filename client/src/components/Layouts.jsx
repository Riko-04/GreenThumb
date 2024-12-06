import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Image,
    useDisclosure,
    useColorMode,
    useToast,
    VStack,
    Text,
    Grid,
    GridItem,
    Input,
    Icon,
    Heading,
    HStack
} from '@chakra-ui/react';
import { FaThLarge, FaTrash, FaSave, FaMap } from 'react-icons/fa';
import { fetchPlants, addLayout, fetchLayouts, updateLayout } from '../utils/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Layouts = () => {
    const [plants, setPlants] = useState([]);
    const [layout, setLayout] = useState([]);
    const [layoutName, setLayoutName] = useState('');
    const [selectedLayoutId, setSelectedLayoutId] = useState(null);
    const { isOpen: isAddModalOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isClearModalOpen, onOpen: onClearOpen, onClose: onClearClose } = useDisclosure();
    const toast = useToast();
    const { colorMode } = useColorMode();

    const gridColumns = 5; // Set grid columns to a constant value of 5

    // Fetch plants data
    const fetchPlantsData = useCallback(async () => {
        try {
            const data = await fetchPlants();
            setPlants(data);
        } catch (error) {
            toast({
                title: 'Error fetching plants',
                description: 'Unable to fetch plant data.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    }, [toast]);

    useEffect(() => {
        fetchPlantsData();
    }, [fetchPlantsData]);

    // Fetch layouts data
    useEffect(() => {
        const fetchSavedLayouts = async () => {
            try {
                const savedLayouts = await fetchLayouts();
                if (savedLayouts.length > 0) {
                    const firstLayout = savedLayouts[0];
                    setLayoutName(firstLayout.name);
                    setSelectedLayoutId(firstLayout.id);
                    setLayout(firstLayout.layout_data);
                }
            } catch (error) {
                toast({
                    title: 'Error fetching layouts',
                    description: error.message || 'Unable to fetch saved layouts.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        };

        fetchSavedLayouts();
    }, [toast]);

    const handleAddImage = (plant) => {
        setLayout((prevLayout) => [...prevLayout, plant]);
    };

    const handleClearLayout = () => {
        setLayout([]);
        onClearClose(); // Close the confirmation modal after clearing layout
    };

    const handleSaveLayout = async () => {
        if (layoutName.trim() === '') {
            toast({
                title: 'Error',
                description: 'Please provide a layout name.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const layoutData = {
                name: layoutName,
                layout_data: layout.map((plant) => ({
                    plant_id: plant.id,
                    name: plant.name,
                    img_url: plant.img_url,
                    position: plant.position || { x: 0, y: 0 },
                })),
            };

            // Check if a layout already exists (we have a selectedLayoutId)
            if (selectedLayoutId) {
                // Update existing layout
                await updateLayout(selectedLayoutId, layoutData);
                toast({
                    title: 'Layout updated',
                    description: 'Your layout has been updated successfully.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                // Add new layout
                const newLayout = await addLayout(layoutData);
                setSelectedLayoutId(newLayout.id); // Save new layout ID
                toast({
                    title: 'Layout saved',
                    description: 'Your layout has been saved successfully.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: 'Error saving layout',
                description: 'Unable to save your layout.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const reorderedLayout = Array.from(layout);
        const [movedItem] = reorderedLayout.splice(result.source.index, 1);
        reorderedLayout.splice(result.destination.index, 0, movedItem);

        setLayout(reorderedLayout);
    };

    return (
        <Box p={4}>
            <VStack
                spacing={4}
                align="center"
                bg="teal.500"
                color="white"
                borderRadius="md"
                p={4}
                mb={6}
                shadow="md"
            >
                <Icon as={FaMap} boxSize={12} />
                <Heading size="md">Garden Layout</Heading>
                <Text fontSize="lg" textAlign="center">
                    Design your garden layout by adding and arranging plants. Use drag and drop to position your plants and save your layout for future reference.
                </Text>
            </VStack>

            <FormControl mb={4}>
                <FormLabel>Layout Name</FormLabel>
                <Input
                    placeholder="Enter layout name"
                    value={layoutName}
                    onChange={(e) => setLayoutName(e.target.value)}
                />
            </FormControl>

            <HStack spacing={2} alignItems="center" mb={4}>
                <Button onClick={onAddOpen} leftIcon={<FaThLarge />}>
                    Add Plant
                </Button>
                <Button onClick={handleSaveLayout} leftIcon={<FaSave />}>
                    Save 
                </Button>
                <Button colorScheme="red" onClick={onClearOpen} leftIcon={<FaTrash />}>
                    Delete
                </Button>
            </HStack>

            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="layoutGrid">
                    {(provided) => (
                        <Grid
                            templateColumns={`repeat(${gridColumns}, 1fr)`} // Ensures consistent size with fixed number of columns
                            gap={6}
                            mt={4}
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {layout.length > 0 ? (
                                layout.map((plant, index) => (
                                    <Draggable key={plant.id} draggableId={`plant-${plant.id}`} index={index}>
                                        {(provided) => (
                                            <GridItem
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                bg="gray.700"
                                                p={0} // Removed padding to let the image fill the entire box
                                                borderRadius="md"
                                                shadow="lg"
                                                color="white"
                                                height="200px" // Fixed height to prevent resizing
                                            >
                                                <Image
                                                    src={plant.img_url}
                                                    alt={plant.name}
                                                    boxSize="100%" // Ensures image takes the full grid item
                                                    objectFit="cover"
                                                    fallbackSrc="https://via.placeholder.com/150"
                                                />
                                            </GridItem>
                                        )}
                                    </Draggable>
                                ))
                            ) : (
                                <Text>No plants in layout yet</Text>
                            )}
                            {provided.placeholder}
                        </Grid>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Add Plant Modal */}
            <Modal isOpen={isAddModalOpen} onClose={onAddClose}>
                <ModalOverlay />
                <ModalContent
                    bg={colorMode === 'dark' ? 'gray.800' : 'white'} // Set modal background color based on the theme
                    color={colorMode === 'dark' ? 'white' : 'black'} // Set text color based on the theme
                >
                    <ModalHeader>Select Plant</ModalHeader>
                    <ModalBody>
                        <VStack align="start" spacing={4}>
                            {plants.map((plant) => (
                                <Box
                                    key={plant.id}
                                    p={4}
                                    borderRadius="md"
                                    bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'} // Set background color based on theme
                                    w="full"
                                    cursor="pointer"
                                    _hover={{ bg: colorMode === 'dark' ? 'gray.600' : 'gray.200' }}
                                    onClick={() => handleAddImage(plant)}
                                >
                                    <HStack spacing={4}>
                                        <Image
                                            src={plant.img_url}
                                            alt={plant.name}
                                            boxSize="50px"
                                            objectFit="cover"
                                        />
                                        <Text>{plant.name}</Text>
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={onAddClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Clear Layout Confirmation Modal */}
            <Modal isOpen={isClearModalOpen} onClose={onClearClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Layout Deletion</ModalHeader>
                    <ModalBody>
                        <Text>Are you sure you want to delete your layout? This action cannot be undone.</Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="red" onClick={handleClearLayout}>
                            Delete
                        </Button>
                        <Button variant="ghost" onClick={onClearClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Layouts;
