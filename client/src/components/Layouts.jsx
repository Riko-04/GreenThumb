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
    useToast,
    VStack,
    Text,
    Grid,
    GridItem,
    IconButton,
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
    const toast = useToast();

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

            if (selectedLayoutId) {
                await updateLayout(selectedLayoutId, layoutData);
                toast({
                    title: 'Layout updated',
                    description: 'Your layout has been updated successfully.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                const newLayout = await addLayout(layoutData);
                setSelectedLayoutId(newLayout.id);
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
                    Add Plant to Layout
                </Button>
                <Button onClick={handleSaveLayout} leftIcon={<FaSave />}>
                    Save Layout
                </Button>
                <Button colorScheme="red" onClick={handleClearLayout} leftIcon={<FaTrash />}>
                    Clear Layout
                </Button>
            </HStack>

            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="layoutGrid">
                    {(provided) => (
                        <Grid
                            templateColumns={`repeat(${gridColumns}, 1fr)`}
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

            <Modal isOpen={isAddModalOpen} onClose={onAddClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Select Plant</ModalHeader>
                    <ModalBody>
                        <VStack align="start" spacing={4}>
                            {plants.map((plant) => (
                                <Box
                                    key={plant.id}
                                    p={4}
                                    borderRadius="md"
                                    bg="gray.700"
                                    boxShadow="md"
                                    w="full"
                                    cursor="pointer"
                                    _hover={{ bg: 'gray.600' }}
                                    onClick={() => {
                                        handleAddImage(plant);
                                        onAddClose();
                                    }}
                                >
                                    <Image
                                        src={plant.img_url}
                                        alt={plant.name}
                                        boxSize="100px"
                                        objectFit="cover"
                                    />
                                    <Text>{plant.name}</Text>
                                </Box>
                            ))}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={onAddClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Layouts;
