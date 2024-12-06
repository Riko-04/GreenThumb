/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-no-duplicate-props */
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  Heading,
  Flex,
  Input,
  Textarea,
  IconButton,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useToast,
  useColorMode,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { BsThreeDotsVertical, BsChatDots } from 'react-icons/bs';
import {
  fetchForumPosts,
  addForumPost,
  updateForumPost,
  deleteForumPost,
  addComment,
  updateComment,
  deleteComment,
} from '../utils/api';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [commentContents, setCommentContents] = useState({});
  const [editingComment, setEditingComment] = useState({ id: null, postId: null });
  const [editCommentContent, setEditCommentContent] = useState('');
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const toast = useToast();
  const { colorMode } = useColorMode();

  const loadPosts = async () => {
    try {
      const fetchedPosts = await fetchForumPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      toast({
        title: 'Error loading posts',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleAddOrUpdateForumPost = async () => {
    if (currentPost) {
      await handleUpdateForumPost();
    } else {
      await handleAddForumPost();
    }
  };

  const handleAddForumPost = async () => {
    try {
      await addForumPost({ title, content });
      toast({
        title: 'Post added successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      loadPosts();
      closeModal();
    } catch (error) {
      toast({
        title: 'Error adding post',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateForumPost = async () => {
    try {
      await updateForumPost(currentPost.id, title, content);
      toast({
        title: 'Post updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      loadPosts();
      closeModal();
    } catch (error) {
      toast({
        title: 'Error updating post',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteForumPost = async () => {
    try {
      if (itemToDelete && itemToDelete.type === 'post') {
        await deleteForumPost(itemToDelete.id);
      } else if (itemToDelete && itemToDelete.type === 'comment') {
        await deleteComment(itemToDelete.id);
      }
      toast({
        title: 'Item deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      loadPosts();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast({
        title: 'Error deleting item',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsDeleteModalOpen(false);
    }
  };

  const handleAddComment = async (postId) => {
    try {
      const content = commentContents[postId] || '';
      await addComment(postId, content);
      toast({
        title: 'Comment added successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      handleCommentChange(postId, '');
      loadPosts();
    } catch (error) {
      toast({
        title: 'Error adding comment',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateComment = async () => {
    try {
      await updateComment(editingComment.id, editCommentContent);
      toast({
        title: 'Comment updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      loadPosts();
      setIsCommentModalOpen(false);
      setEditCommentContent('');
      setEditingComment({ id: null, postId: null });
    } catch (error) {
      toast({
        title: 'Error updating comment',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentContents((prev) => ({ ...prev, [postId]: value }));
  };

  const handleEditComment = (comment, postId) => {
    setEditCommentContent(comment.content);
    setEditingComment({ id: comment.id, postId });
    setIsCommentModalOpen(true);
  };

  const handleDeleteComment = (commentId) => {
    setItemToDelete({ id: commentId, type: 'comment' });
    setIsDeleteModalOpen(true);
  };

  const openModal = (post = null) => {
    setCurrentPost(post);
    setTitle(post ? post.title : '');
    setContent(post ? post.content : '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeletePost = (postId) => {
    setItemToDelete({ id: postId, type: 'post' });
    setIsDeleteModalOpen(true);
  };

  return (
    <Box p={4} bg={colorMode === 'dark' ? 'gray.800' : 'gray.100'}>
      <VStack spacing={4} align="center" bg="teal.500" color="white" borderRadius="md" p={4} mb={6} shadow="md">
        <Icon as={BsChatDots} boxSize={12} color="white" aria-label="Forum Icon" />
        <Heading size="md">Community Forum</Heading>
        <Text fontSize="lg" textAlign="center">
          <Box mb={2}>
            Share your thoughts and experiences with other gardeners. Connect, learn, and grow together!
          </Box>
          <Box>Note: Please keep your responses respectful and considerate of others.</Box>
        </Text>
      </VStack>
      <Text color="red.500" mt={0} mb={2}>Changes can only be made by the owner</Text>
      <Button onClick={() => openModal()} colorScheme="teal" mb={4}>
        Add Post
      </Button>

      <VStack spacing={4} align="stretch">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Box key={post.id} p={4} borderRadius="md" shadow="md" bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
              <Flex justifyContent="space-between" alignItems="center">
                <Heading size="md">{post.title}</Heading>
                <Box>
                  <Text
                    fontSize="sm"
                    color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
                    bg={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
                    p={1}
                    px={2}
                    borderRadius="full"
                    shadow="inner"
                  >
                    Posted by {post.author}
                  </Text>
                </Box>
                <Menu>
                  <MenuButton as={IconButton} icon={<BsThreeDotsVertical />} variant="ghost" />
                  <MenuList>
                    <MenuItem icon={<EditIcon />} onClick={() => openModal(post)}>
                      Edit Post
                    </MenuItem>
                    <MenuItem icon={<DeleteIcon />} onClick={() => handleDeletePost(post.id)}>
                      Delete Post
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
              <Text mt={2}>{post.content}</Text>

              <Text fontSize="md" mt={4} mb={3} fontWeight="bold">
                Comments
              </Text>
              <Flex mt={2} w="100%">
                <Input
                  placeholder="Write a comment..."
                  value={commentContents[post.id] || ''}
                  onChange={(e) => handleCommentChange(post.id, e.target.value)}
                  size="sm"
                  mr={2}
                />
                <Button onClick={() => handleAddComment(post.id)} colorScheme="teal" size="sm" isDisabled={!commentContents[post.id]?.trim()}>
                  Add Comment
                </Button>
              </Flex>
              <VStack align="start" mt={2} spacing={2}>
                {post.comments.map((comment) => (
                  <Box key={comment.id} p={3} borderRadius="md" bg={colorMode === 'dark' ? 'gray.600' : 'gray.50'} w="100%">
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text fontSize="md" color={colorMode === 'dark' ? 'gray.300' : 'gray.700'}>
                        {comment.content}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        ~ {comment.author}
                      </Text>
                      <Menu>
                        <MenuButton as={IconButton} icon={<BsThreeDotsVertical />} variant="ghost" />
                        <MenuList>
                          <MenuItem icon={<EditIcon />} onClick={() => handleEditComment(comment, post.id)}>
                            Edit Comment
                          </MenuItem>
                          <MenuItem icon={<DeleteIcon />} onClick={() => handleDeleteComment(comment.id)}>
                            Delete Comment
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </Box>
          ))
        ) : (
          <Text>No posts available. Start a conversation!</Text>
        )}
      </VStack>

      {/* Modal for creating/editing posts */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentPost ? 'Edit Post' : 'New Post'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post Title"
              mb={4}
            />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Post Content"
              mb={4}
              height="150px"
            />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="teal" onClick={handleAddOrUpdateForumPost} mr={3}>
              {currentPost ? 'Update' : 'Post'}
            </Button>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for confirming delete */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this item?</Text>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" onClick={handleDeleteForumPost} mr={3}>
              Delete
            </Button>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for editing comments */}
      <Modal isOpen={isCommentModalOpen} onClose={() => setIsCommentModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Comment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              value={editCommentContent}
              onChange={(e) => setEditCommentContent(e.target.value)}
              placeholder="Edit your comment"
              mb={4}
              height="100px"
            />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="teal" onClick={handleUpdateComment} mr={3}>
              Save Changes
            </Button>
            <Button variant="ghost" onClick={() => setIsCommentModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Forum;
