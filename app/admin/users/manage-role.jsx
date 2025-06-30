'use client';

import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  useToast,
  Text,
  Box,
} from '@chakra-ui/react';
import { updateUserRole } from '@/lib/userService';

/**
 * Component for managing user roles
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.user - User object to manage
 * @param {Function} props.onRoleUpdate - Callback after role update
 */
export default function ManageRoleModal({ isOpen, onClose, user, onRoleUpdate }) {
  const [role, setRole] = useState(user?.role || 'user');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Available roles
  const roles = [
    { value: 'user', label: 'Regular User' },
    { value: 'admin', label: 'Admin' },
    { value: 'superAdmin', label: 'Super Admin' },
  ];

  const handleRoleChange = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const success = await updateUserRole(user.id, role);

      if (success) {
        toast({
          title: 'Role updated',
          description: `User ${user.name || user.email} is now a ${role}.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Call the callback to refresh the user list
        if (onRoleUpdate) {
          onRoleUpdate();
        }

        onClose();
      } else {
        throw new Error('Failed to update role');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Error updating role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage User Role</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {user ? (
            <>
              <Text mb={4}>
                Update role for <strong>{user.name || user.email}</strong>
              </Text>
              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {roles.map((roleOption) => (
                    <option key={roleOption.value} value={roleOption.value}>
                      {roleOption.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {role === 'superAdmin' && (
                <Box mt={4} p={3} bg="red.50" borderRadius="md" borderLeft="4px" borderColor="red.500">
                  <Text color="red.600" fontWeight="medium">
                    Warning: SuperAdmin has full control over the application, including the ability to manage other admins.
                  </Text>
                </Box>
              )}

              {role === 'admin' && (
                <Box mt={4} p={3} bg="blue.50" borderRadius="md" borderLeft="4px" borderColor="blue.500">
                  <Text color="blue.600">
                    Admin users can access the admin panel and manage content, but cannot change user roles.
                  </Text>
                </Box>
              )}
            </>
          ) : (
            <Text>No user selected</Text>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleRoleChange}
            isLoading={isLoading}
            isDisabled={!user || user.role === role}
          >
            Update Role
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
