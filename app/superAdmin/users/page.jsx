"use client";
import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  setUserStatus,
  deleteUser,
  getUserStats,
} from "../../../lib/superAdminUserService";
import {
  Box,
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaLock, FaUnlock, FaTrash } from "react-icons/fa";

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const boxBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const modalBg = useColorModeValue("white", "gray.800");
  const tableBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const all = await getAllUsers();
      setUsers(all);
      setFiltered(all);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!search) setFiltered(users);
    else
      setFiltered(
        users.filter(
          (u) =>
            (u.displayName || "")
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            (u.email || "").toLowerCase().includes(search.toLowerCase())
        )
      );
  }, [search, users]);

  const handleBlockToggle = async (user) => {
    setActionLoading(true);
    await setUserStatus(
      user.id,
      user.status === "blocked" ? "active" : "blocked"
    );
    setUsers(
      users.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === "blocked" ? "active" : "blocked" }
          : u
      )
    );
    setActionLoading(false);
  };

  const handleDelete = async (user) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setActionLoading(true);
    await deleteUser(user.id);
    setUsers(users.filter((u) => u.id !== user.id));
    setFiltered(filtered.filter((u) => u.id !== user.id));
    setActionLoading(false);
  };

  const handleRowClick = async (user) => {
    setSelectedUser(user);
    setUserStats(null);
    onOpen();
    const stats = await getUserStats(user.id);
    setUserStats(stats);
  };

  return (
    <Box
      p={6}
      mt={8}
      bg={boxBg}
      color={textColor}
      borderRadius="md"
      boxShadow="md"
    >
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
      <Input
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb={4}
        maxW="400px"
        bg={boxBg}
        color={textColor}
        borderColor={borderColor}
      />
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <Table
          variant="simple"
          bg={tableBg}
          borderColor={borderColor}
          className="rounded shadow"
        >
          <Thead bg={boxBg}>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((user) => (
              <Tr
                key={user.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleRowClick(user)}
              >
                <Td>{user.displayName || user.name}</Td>
                <Td>{user.email}</Td>
                <Td>{user.role}</Td>
                <Td>{user.status || "active"}</Td>
                <Td>
                  {user.createdAt && user.createdAt.toDate
                    ? user.createdAt.toDate().toLocaleDateString()
                    : ""}
                </Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    colorScheme={user.status === "blocked" ? "green" : "red"}
                    mr={2}
                    isLoading={actionLoading}
                    onClick={() => handleBlockToggle(user)}
                  >
                    {user.status === "blocked" ? <FaUnlock /> : <FaLock />}
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    isLoading={actionLoading}
                    onClick={() => handleDelete(user)}
                  >
                    <FaTrash />
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      {/* User Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={modalBg} color={textColor}>
          <ModalHeader>User Details</ModalHeader>
          <ModalBody>
            {selectedUser && (
              <Box
                bg={boxBg}
                p={6}
                borderRadius="md"
                boxShadow="md"
                color={textColor}
              >
                <Text>
                  <b>Name:</b> {selectedUser.displayName || selectedUser.name}
                </Text>
                <Text>
                  <b>Email:</b> {selectedUser.email}
                </Text>
                <Text>
                  <b>Role:</b> {selectedUser.role}
                </Text>
                <Text>
                  <b>Status:</b> {selectedUser.status || "active"}
                </Text>
                <Text>
                  <b>Joined:</b>{" "}
                  {selectedUser.createdAt && selectedUser.createdAt.toDate
                    ? selectedUser.createdAt.toDate().toLocaleString()
                    : ""}
                </Text>
                {userStats ? (
                  <>
                    <Text>
                      <b>Bundles Purchased:</b> {userStats.bundlesPurchased}
                    </Text>
                    <Text>
                      <b>Tests Taken:</b> {userStats.testsTaken}
                    </Text>
                    <Text>
                      <b>Active Time:</b>{" "}
                      {userStats.activeTime !== null
                        ? `${userStats.activeTime} days`
                        : "N/A"}
                    </Text>
                  </>
                ) : (
                  <Spinner size="sm" />
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
