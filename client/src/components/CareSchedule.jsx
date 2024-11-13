import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  useToast,
  VStack,
  Heading,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Icon,
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaEllipsisV, FaCalendarPlus } from 'react-icons/fa';
import { fetchCareSchedules, addCareSchedule, updateCareSchedule, deleteCareSchedule, fetchPlants } from '../utils/api';

const CareSchedule = () => {
  const [careSchedules, setCareSchedules] = useState([]);
  const [plants, setPlants] = useState([]);
  const [formData, setFormData] = useState({
    task: '',
    schedule_date: '',
    interval: '',
    plant_id: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [currentScheduleId, setCurrentScheduleId] = useState(null);
  const [dueSchedule, setDueSchedule] = useState(null);

  const { isOpen: isAddEditModalOpen, onOpen: onOpenAddEditModal, onClose: onCloseAddEditModal } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onOpenDeleteModal, onClose: onCloseDeleteModal } = useDisclosure();
  const { isOpen: isDueModalOpen, onOpen: onOpenDueModal, onClose: onCloseDueModal } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    loadCareSchedules();
    loadPlants();
  }, []);

  const loadCareSchedules = async () => {
    try {
      const schedules = await fetchCareSchedules();
      setCareSchedules(schedules);
    } catch (error) {
      console.error('Error fetching care schedules:', error);
    }
  };

  const loadPlants = async () => {
    try {
      const plants = await fetchPlants();
      setPlants(plants);
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateCareSchedule(currentScheduleId, formData);
        toast({
          title: 'Care Schedule Updated.',
          description: 'The care schedule has been successfully updated.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setEditMode(false);
        setCurrentScheduleId(null);
      } else {
        await addCareSchedule(formData);
        toast({
          title: 'Care Schedule Added.',
          description: 'The care schedule has been successfully added.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      setFormData({ task: '', schedule_date: '', interval: '', plant_id: '' });
      onCloseAddEditModal();
      loadCareSchedules();
    } catch (error) {
      console.error('Error saving care schedule:', error);
      toast({
        title: 'Error.',
        description: 'There was an error saving the care schedule.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openAddModal = () => {
    setFormData({ task: '', schedule_date: '', interval: '', plant_id: '' });
    setEditMode(false);
    onOpenAddEditModal();
  };

  const openEditModal = (schedule) => {
    setCurrentScheduleId(schedule.id);
    setFormData({
      task: schedule.task,
      schedule_date: schedule.schedule_date,
      interval: schedule.interval,
      plant_id: schedule.plant_id,
    });
    setEditMode(true);
    onOpenAddEditModal();
  };

  const openDeleteModal = (schedule) => {
    setCurrentScheduleId(schedule.id);
    onOpenDeleteModal();
  };

  const handleDeleteSchedule = async () => {
    try {
      await deleteCareSchedule(currentScheduleId);
      toast({
        title: 'Care Schedule Deleted.',
        description: 'The care schedule has been successfully deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onCloseDeleteModal();
      loadCareSchedules();
    } catch (error) {
      console.error('Error deleting care schedule:', error);
      toast({
        title: 'Error.',
        description: 'There was an error deleting the care schedule.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const checkIfDue = useCallback((scheduleDate, interval, now) => {
    if (interval === 'daily') {
      return now.isSame(scheduleDate, 'day');
    }
    if (interval === 'weekly') {
      return now.isSame(scheduleDate.add(1, 'week'), 'week');
    }
    if (interval === 'fortnightly') {
      return now.isSame(scheduleDate.add(2, 'weeks'), 'week');
    }
    if (interval === 'monthly') {
      return now.isSame(scheduleDate.add(1, 'month'), 'month');
    }
    return false;
  }, []);

  const checkDueCareSchedules = useCallback(() => {
    const now = dayjs();
    careSchedules.forEach(schedule => {
      const scheduleDate = dayjs(schedule.schedule_date);
      const interval = schedule.interval;
      const isDue = checkIfDue(scheduleDate, interval, now);

      if (isDue) {
        setDueSchedule(schedule);
        onOpenDueModal();
      }
    });
  }, [careSchedules, checkIfDue]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkDueCareSchedules();
    }, 5000);

    return () => clearInterval(interval);
  }, [careSchedules, checkDueCareSchedules]);

  const handleAcknowledgeDue = async () => {
    const updatedSchedule = { ...dueSchedule };
    const intervalMapping = {
      daily: 1,
      weekly: 7,
      fortnightly: 14,
      monthly: 30,
    };
    const incrementDays = intervalMapping[dueSchedule.interval] || 1;
    updatedSchedule.schedule_date = dayjs(dueSchedule.schedule_date).add(incrementDays, 'day').format('YYYY-MM-DD');

    await updateCareSchedule(dueSchedule.id, updatedSchedule);
    toast({
      title: 'Care Task Acknowledged.',
      description: 'The task has been acknowledged and rescheduled.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onCloseDueModal();
    loadCareSchedules();
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
        <Icon as={FaCalendarPlus} boxSize={12} />
        <Heading size="md">Manage Your Care Schedules</Heading>
        <Text fontSize="lg" textAlign="center">
          Track and manage care schedules for your plants. Add, edit, or delete care tasks as needed.
        </Text>
      </VStack>

      <Button mb={4} colorScheme="teal" onClick={openAddModal}>
        Add Care Schedule
      </Button>

      <Table variant="simple">
        <TableCaption>Care Schedules</TableCaption>
        <Thead>
          <Tr>
            <Th>Task</Th>
            <Th>Schedule Date</Th>
            <Th>Interval</Th>
            <Th>Plant</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {careSchedules.length > 0 ? (
            careSchedules.map((schedule) => (
              <Tr key={schedule.id}>
                <Td>{schedule.task}</Td>
                <Td>{schedule.schedule_date}</Td>
                <Td>{schedule.interval}</Td>
                <Td>
                  {plants.find((plant) => plant.id === schedule.plant_id)?.name || 'Unknown Plant'}
                </Td>
                <Td>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="Options"
                      icon={<FaEllipsisV />}
                      variant="outline"
                    />
                    <MenuList>
                      <MenuItem
                        icon={<FaEdit />}
                        onClick={() => openEditModal(schedule)}
                      >
                        Edit
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem
                        icon={<FaTrash />}
                        onClick={() => openDeleteModal(schedule)}
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={5} textAlign="center">
                No care schedules available
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>

      {/* Modals for adding, editing, deleting, and due schedules */}
      {/* Add/Edit Schedule Modal */}
      <Modal isOpen={isAddEditModalOpen} onClose={onCloseAddEditModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editMode ? 'Edit Care Schedule' : 'Add Care Schedule'}</ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <FormControl mb={3}>
                <FormLabel>Task</FormLabel>
                <Input
                  name="task"
                  value={formData.task}
                  onChange={handleChange}
                  placeholder="Enter task description"
                  required
                />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Schedule Date</FormLabel>
                <Input
                  type="date"
                  name="schedule_date"
                  value={formData.schedule_date}
                  onChange={handleChange}
                  required
                />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Interval</FormLabel>
                <Select
                  name="interval"
                  value={formData.interval}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select interval</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Plant</FormLabel>
                <Select
                  name="plant_id"
                  value={formData.plant_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a plant</option>
                  {plants.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      {plant.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleSubmit}>
              {editMode ? 'Update' : 'Add'}
            </Button>
            <Button variant="ghost" onClick={onCloseAddEditModal}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onCloseDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            Are you sure you want to delete this care schedule?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleDeleteSchedule}>
              Delete
            </Button>
            <Button variant="ghost" onClick={onCloseDeleteModal}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Due Schedule Modal */}
      <Modal isOpen={isDueModalOpen} onClose={onCloseDueModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Task Due</ModalHeader>
          <ModalBody>
            <Text fontSize="md" fontWeight="medium">
              Task: {dueSchedule?.task}
            </Text>
            <Text fontSize="md">Schedule Date: {dueSchedule?.schedule_date}</Text>
            <Text fontSize="md">Interval: {dueSchedule?.interval}</Text>
            <Text fontSize="md">
              Plant: {plants.find((plant) => plant.id === dueSchedule?.plant_id)?.name || 'Unknown Plant'}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleAcknowledgeDue}>
              Acknowledge
            </Button>
            <Button variant="ghost" onClick={onCloseDueModal}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CareSchedule;
