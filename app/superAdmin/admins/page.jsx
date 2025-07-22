"use client";
import React, { useEffect, useState } from "react";
import {getAllAdmins, validateAdmin, setAdminStatus, deleteAdmin, getAdminStats,} from "../../../lib/superAdminAdminService";
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
  Badge,
  Stack, Text, Avatar,
  useColorModeValue
} from "@chakra-ui/react";
import { FaLock, FaUnlock, FaTrash } from "react-icons/fa";

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const boxBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const modalBg = useColorModeValue("white", "gray.800");
  const tableBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    async function fetchAdmins() {
      setLoading(true);
      const all = await getAllAdmins();
      setAdmins(all);
      setFiltered(all);
      setLoading(false);
    }
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (!search) setFiltered(admins);
    else
      setFiltered(
        admins.filter(
          (a) =>
            (a.displayName || "")
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            (a.email || "").toLowerCase().includes(search.toLowerCase())
        )
      );
  }, [search, admins]);

  const handleValidate = async (admin) => {
    setActionLoading(true);
    await validateAdmin(admin.id);
    setAdmins(
      admins.map((a) => (a.id === admin.id ? { ...a, validated: true } : a))
    );
    setActionLoading(false);
  };

  const handleBlockToggle = async (admin) => {
    setActionLoading(true);
    await setAdminStatus(
      admin.id,
      admin.status === "blocked" ? "active" : "blocked"
    );
    setAdmins(
      admins.map((a) =>
        a.id === admin.id
          ? { ...a, status: a.status === "blocked" ? "active" : "blocked" }
          : a
      )
    );
    setActionLoading(false);
  };

  const handleDelete = async (admin) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    setActionLoading(true);
    await deleteAdmin(admin.id);
    setAdmins(admins.filter((a) => a.id !== admin.id));
    setFiltered(filtered.filter((a) => a.id !== admin.id));
    setActionLoading(false);
  };

  const handleRowClick = async (admin) => {
    setSelectedAdmin(admin);
    setAdminStats(null);
    onOpen();
    const stats = await getAdminStats(admin.id);
    setAdminStats(stats);
  };

  return (
    <Box p={6} mt={8} bg={boxBg} color={textColor} borderRadius="md" boxShadow="md">
      <h2 className="text-2xl font-bold mb-4">Manage Admins</h2>
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
        <Table variant="simple" bg={tableBg} borderColor={borderColor} className="rounded shadow">
          <Thead bg={boxBg}>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Validated</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((admin) => (
              <Tr
                key={admin.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleRowClick(admin)}
              >
                <Td>{admin.displayName || admin.name}</Td>
                <Td>{admin.email}</Td>
                <Td>
                  {admin.validated ? (
                    <Badge colorScheme="green">Yes</Badge>
                  ) : (
                    <Badge colorScheme="yellow">No</Badge>
                  )}
                </Td>
                <Td>{admin.status || "active"}</Td>
                <Td>
                  {admin.createdAt && admin.createdAt.toDate
                    ? admin.createdAt.toDate().toLocaleDateString()
                    : ""}
                </Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  {!admin.validated && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      mr={2}
                      isLoading={actionLoading}
                      onClick={() => handleValidate(admin)}
                    >
                      <FaTrash />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    colorScheme={admin.status === "blocked" ? "green" : "red"}
                    mr={2}
                    isLoading={actionLoading}
                    onClick={() => handleBlockToggle(admin)}
                  >
                    {admin.status === 'blocked' ? <FaUnlock /> : <FaLock />}
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    isLoading={actionLoading}
                    onClick={() => handleDelete(admin)}
                  >
                    <FaTrash />
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      {/* Admin Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={modalBg} color={textColor}>
          <ModalHeader>Admin Details</ModalHeader>
          <ModalBody>
            {selectedAdmin && (
              <Box
                bg={boxBg}
                p={6}
                borderRadius="md"
                boxShadow="md"
                color={textColor}
              >
                <Stack spacing={3}>
                  <Text>
                    <b>Name:</b> {selectedAdmin.displayName || selectedAdmin.name}
                  </Text>
                  <Text>
                    <b>Email:</b> {selectedAdmin.email}
                  </Text>
                  <Text>
                    <b>Validated:</b> {selectedAdmin.validated ? "Yes" : "No"}
                  </Text>
                  <Text>
                    <b>Status:</b> {selectedAdmin.status || "active"}
                  </Text>
                  <Text>
                    <b>Joined:</b>{" "}
                    {selectedAdmin.createdAt && selectedAdmin.createdAt.toDate
                      ? selectedAdmin.createdAt.toDate().toLocaleString()
                      : ""}
                  </Text>
                  <Text>
                    <b>Qualifications:</b> {selectedAdmin.qualifications}
                  </Text>
                  <Text>
                    <b>Subjects/Exams Taught:</b>{" "}
                    {Array.isArray(selectedAdmin.subjects)
                      ? selectedAdmin.subjects.join(", ")
                      : selectedAdmin.subjects}
                  </Text>
                  <Text>
                    <b>Teaching Experience:</b> {selectedAdmin.experience}
                  </Text>
                  <Text>
                    <b>Phone Number:</b> {selectedAdmin.phone}
                  </Text>
                  <Box>
                    <b>Profile Picture:</b>{" "}
                    {selectedAdmin.profilePic ? (
                      <Avatar
                        src={selectedAdmin.profilePic}
                        name={selectedAdmin.displayName || selectedAdmin.name}
                        size="md"
                        ml={2}
                      />
                    ) : (
                      <span>No picture</span>
                    )}
                  </Box>
                  {adminStats ? (
                    <>
                      <Text>
                        <b>Bundles Created:</b> {adminStats.bundlesCreated}
                      </Text>
                      <Text>
                        <b>Revenue:</b> ₹{adminStats.revenue}
                      </Text>
                      <Text>
                        <b>Engagement (Bundle Purchases):</b> {adminStats.engagement}
                      </Text>
                    </>
                  ) : (
                    <Spinner size="sm" />
                  )}
                </Stack>
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
