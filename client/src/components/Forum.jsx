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
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { BsThreeDotsVertical, BsChatDots } from 'react-icons/bs'; // Added forum icon
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
      await updateForumPost(currentPost.id, { title, content });
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

  const handleDeleteForumPost = async (postId) => {
    try {
      await deleteForumPost(postId);
      toast({
        title: 'Post deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      loadPosts();
    } catch (error) {
      toast({
        title: 'Error deleting post',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      toast({
        title: 'Comment deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      loadPosts();
    } catch (error) {
      toast({
        title: 'Error deleting comment',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
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

  return (
    <Box p={4} bg={colorMode === 'dark' ? 'gray.800' : 'gray.100'}>
      <VStack spacing={4} align="center" bg="teal.500" color="white" borderRadius="md" p={4} mb={6} shadow="md">
        <Icon
          as={BsChatDots}
          boxSize={12} 
          color="white"
          aria-label="Forum Icon"
        />
        <Heading size="md">Community Forum</Heading>
        <Text fontSize="lg" textAlign="center">
        Share your thoughts and experiences with other gardeners. Connect, learn, and grow together!
        </Text>
      </VStack>
      <Text color="red.500" mt={0} mb={2}>Changes can only be made by the owner</Text>
      <Button onClick={() => openModal()} leftIcon={<AddIcon />} colorScheme="teal" mb={4}>
        New Post
      </Button>

      <VStack spacing={4} align="stretch">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Box key={post.id} p={4} borderRadius="md" shadow="md" bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
              <Flex justifyContent="space-between" alignItems="center">
                <Heading size="md">{post.title}</Heading>
                <Text fontSize="sm" color="gray.500">
                  {post.username}
                </Text>
                <Menu>
                  <MenuButton as={IconButton} icon={<BsThreeDotsVertical />} variant="ghost" />
                  <MenuList>
                    <MenuItem icon={<EditIcon />} onClick={() => openModal(post)}>
                      Edit Post
                    </MenuItem>
                    <MenuItem icon={<DeleteIcon />} onClick={() => handleDeleteForumPost(post.id)}>
                      Delete Post
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
              <Text mt={2}>{post.content}</Text>

              <Text fontSize="sm" mt={4} fontWeight="bold">
                Comments
              </Text>
              <VStack align="start" mt={2} spacing={3}>
                {post.comments.map((comment) => (
                  <Box
                    key={comment.id}
                    p={2}
                    bg={colorMode === 'dark' ? 'gray.600' : 'gray.100'}
                    borderRadius="md"
                    w="100%"
                  >
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text>{comment.content}</Text>
                      <Text fontSize="sm" color="gray.500">
                        - {comment.username}
                      </Text>
                      <Menu>
                        <MenuButton as={IconButton} icon={<BsThreeDotsVertical />} variant="ghost" size="sm" />
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
                <Flex w="100%">
                  <Input
                    placeholder="Add a comment..."
                    value={commentContents[post.id] || ''}
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                    size="sm"
                  />
                  <Button
                    ml={2}
                    size="sm"
                    colorScheme="teal"
                    onClick={() => handleAddComment(post.id)}
                    isDisabled={!commentContents[post.id]}
                  >
                    Post
                  </Button>
                </Flex>
              </VStack>
            </Box>
          ))
        ) : (
          <Text>No posts yet. Be the first to share something!</Text>
        )}
      </VStack>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentPost ? 'Edit Post' : 'New Post'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              mb={4}
            />
            <Textarea
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleAddOrUpdateForumPost}>
              {currentPost ? 'Update Post' : 'Add Post'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isCommentModalOpen} onClose={() => setIsCommentModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Comment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              placeholder="Edit your comment"
              value={editCommentContent}
              onChange={(e) => setEditCommentContent(e.target.value)}
              rows={4}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleUpdateComment}>
              Update Comment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Forum;
