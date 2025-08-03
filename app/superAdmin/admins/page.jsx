// "use client";
// import React, { useEffect, useState } from "react";
// import {getAllAdmins, validateAdmin, setAdminStatus, deleteAdmin, getAdminStats,} from "../../../lib/superAdminAdminService";
// import {
//   Box,
//   Button,
//   Input,
//   Table,
//   Thead,
//   Tbody,
//   Tr,
//   Th,
//   Td,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   useDisclosure,
//   Spinner,
//   Badge,
//   Stack, Text, Avatar,
//   useColorModeValue
// } from "@chakra-ui/react";
// import { FaLock, FaUnlock, FaTrash, FaCheck } from "react-icons/fa";

// export default function SuperAdminAdminsPage() {
//   const [admins, setAdmins] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [search, setSearch] = useState("");
//   const [selectedAdmin, setSelectedAdmin] = useState(null);
//   const [adminStats, setAdminStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
//   const { isOpen, onOpen, onClose } = useDisclosure();

//   const boxBg = useColorModeValue("white", "gray.800");
//   const textColor = useColorModeValue("gray.800", "white");
//   const modalBg = useColorModeValue("white", "gray.800");
//   const tableBg = useColorModeValue("white", "gray.700");
//   const borderColor = useColorModeValue("gray.200", "gray.700");

//   useEffect(() => {
//     async function fetchAdmins() {
//       setLoading(true);
//       const all = await getAllAdmins();
//       setAdmins(all);
//       setFiltered(all);
//       setLoading(false);
//     }
//     fetchAdmins();
//   }, []);

//   useEffect(() => {
//     if (!search) setFiltered(admins);
//     else
//       setFiltered(
//         admins.filter(
//           (a) =>
//             (a.displayName || "")
//               .toLowerCase()
//               .includes(search.toLowerCase()) ||
//             (a.email || "").toLowerCase().includes(search.toLowerCase())
//         )
//       );
//   }, [search, admins]);

//   const handleValidate = async (admin) => {
//     setActionLoading(true);
//     await validateAdmin(admin.id);
//     setAdmins(
//       admins.map((a) => (a.id === admin.id ? { ...a, validated: true } : a))
//     );
//     setActionLoading(false);
//   };

//   const handleBlockToggle = async (admin) => {
//     setActionLoading(true);
//     await setAdminStatus(
//       admin.id,
//       admin.status === "blocked" ? "active" : "blocked"
//     );
//     setAdmins(
//       admins.map((a) =>
//         a.id === admin.id
//           ? { ...a, status: a.status === "blocked" ? "active" : "blocked" }
//           : a
//       )
//     );
//     setActionLoading(false);
//   };

//   const handleDelete = async (admin) => {
//     if (!window.confirm("Are you sure you want to delete this admin?")) return;
//     setActionLoading(true);
//     await deleteAdmin(admin.id);
//     setAdmins(admins.filter((a) => a.id !== admin.id));
//     setFiltered(filtered.filter((a) => a.id !== admin.id));
//     setActionLoading(false);
//   };

//   const handleRowClick = async (admin) => {
//     setSelectedAdmin(admin);
//     setAdminStats(null);
//     onOpen();
//     const stats = await getAdminStats(admin.id);
//     setAdminStats(stats);
//   };

//   return (
//     <Box p={6} mt={8} bg={boxBg} color={textColor} borderRadius="md" boxShadow="md">
//       <h2 className="text-2xl font-bold mb-4">Manage Admins</h2>
//       <Input
//         placeholder="Search by name or email"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         mb={4}
//         maxW="400px"
//         bg={boxBg}
//         color={textColor}
//         borderColor={borderColor}
//       />
//       {loading ? (
//         <Spinner size="lg" />
//       ) : (
//         <Table variant="simple" bg={tableBg} borderColor={borderColor} className="rounded shadow">
//           <Thead bg={boxBg}>
//             <Tr>
//               <Th>Name</Th>
//               <Th>Email</Th>
//               <Th>Validated</Th>
//               <Th>Status</Th>
//               <Th>Joined</Th>
//               <Th>Actions</Th>
//             </Tr>
//           </Thead>
//           <Tbody>
//             {filtered.map((admin) => (
//               <Tr
//                 key={admin.id}
//                 className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
//                 onClick={() => handleRowClick(admin)}
//               >
//                 <Td>{admin.displayName || admin.name}</Td>
//                 <Td>{admin.email}</Td>
//                 <Td>
//                   {admin.validated ? (
//                     <Badge colorScheme="green">Yes</Badge>
//                   ) : (
//                     <Badge colorScheme="yellow">No</Badge>
//                   )}
//                 </Td>
//                 <Td>{admin.status || "active"}</Td>
//                 <Td>
//                   {admin.createdAt && admin.createdAt.toDate
//                     ? admin.createdAt.toDate().toLocaleDateString()
//                     : ""}
//                 </Td>
//                 <Td onClick={(e) => e.stopPropagation()}>
//                   {!admin.validated && (
//                     <Button
//                       size="sm"
//                       colorScheme="blue"
//                       mr={2}
//                       isLoading={actionLoading}
//                       onClick={() => handleValidate(admin)}
//                     >
//                       <FaCheck />
//                     </Button>
//                   )}
//                   <Button
//                     size="sm"
//                     colorScheme={admin.status === "blocked" ? "green" : "red"}
//                     mr={2}
//                     isLoading={actionLoading}
//                     onClick={() => handleBlockToggle(admin)}
//                   >
//                     {admin.status === 'blocked' ? <FaUnlock /> : <FaLock />}
//                   </Button>
//                   <Button
//                     size="sm"
//                     colorScheme="red"
//                     isLoading={actionLoading}
//                     onClick={() => handleDelete(admin)}
//                   >
//                     <FaTrash />
//                   </Button>
//                 </Td>
//               </Tr>
//             ))}
//           </Tbody>
//         </Table>
//       )}
//       {/* Admin Detail Modal */}
//       <Modal isOpen={isOpen} onClose={onClose} size="lg">
//         <ModalOverlay />
//         <ModalContent bg={modalBg} color={textColor}>
//           <ModalHeader>Admin Details</ModalHeader>
//           <ModalBody>
//             {selectedAdmin && (
//               <Box
//                 bg={boxBg}
//                 p={6}
//                 borderRadius="md"
//                 boxShadow="md"
//                 color={textColor}
//               >
//                 <Stack spacing={3}>
//                   <Text>
//                     <b>Name:</b> {selectedAdmin.displayName || selectedAdmin.name}
//                   </Text>
//                   <Text>
//                     <b>Email:</b> {selectedAdmin.email}
//                   </Text>
//                   <Text>
//                     <b>Validated:</b> {selectedAdmin.validated ? "Yes" : "No"}
//                   </Text>
//                   <Text>
//                     <b>Status:</b> {selectedAdmin.status || "active"}
//                   </Text>
//                   <Text>
//                     <b>Joined:</b>{" "}
//                     {selectedAdmin.createdAt && selectedAdmin.createdAt.toDate
//                       ? selectedAdmin.createdAt.toDate().toLocaleString()
//                       : ""}
//                   </Text>
//                   <Text>
//                     <b>Qualifications:</b> {selectedAdmin.qualifications}
//                   </Text>
//                   <Text>
//                     <b>Subjects/Exams Taught:</b>{" "}
//                     {Array.isArray(selectedAdmin.subjects)
//                       ? selectedAdmin.subjects.join(", ")
//                       : selectedAdmin.subjects}
//                   </Text>
//                   <Text>
//                     <b>Teaching Experience:</b> {selectedAdmin.experience}
//                   </Text>
//                   <Text>
//                     <b>Phone Number:</b> {selectedAdmin.phone}
//                   </Text>
//                   <Box>
//                     <b>Profile Picture:</b>{" "}
//                     {selectedAdmin.profilePic ? (
//                       <Avatar
//                         src={selectedAdmin.profilePic}
//                         name={selectedAdmin.displayName || selectedAdmin.name}
//                         size="md"
//                         ml={2}
//                       />
//                     ) : (
//                       <span>No picture</span>
//                     )}
//                   </Box>
//                   {adminStats ? (
//                     <>
//                       <Text>
//                         <b>Bundles Created:</b> {adminStats.bundlesCreated}
//                       </Text>
//                       <Text>
//                         <b>Revenue:</b> ₹{adminStats.revenue}
//                       </Text>
//                       <Text>
//                         <b>Engagement (Bundle Purchases):</b> {adminStats.engagement}
//                       </Text>
//                     </>
//                   ) : (
//                     <Spinner size="sm" />
//                   )}
//                 </Stack>
//               </Box>
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <Button onClick={onClose}>Close</Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import {
  getAllAdmins,
  validateAdmin,
  setAdminStatus,
  deleteAdmin,
  getAdminStats,
} from "../../../lib/superAdminAdminService";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { FiDelete, FiDownload, FiLock, FiUnlock } from "react-icons/fi";

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [search, setSearch] = useState("");
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const adminsPerPage = 10;

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
    setCurrentPage(1);
  }, [search, admins]);

  const handleRowClick = async (admin) => {
    setSelectedAdmin(admin);
    setAdminStats(null);
    onOpen();

    try {
      const stats = await getAdminStats(admin.id); // Fetch stats here
      setAdminStats(stats);
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    }
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

  const handleValidate = async (admin) => {
    setActionLoading(true);
    await validateAdmin(admin.id);
    setAdmins(
      admins.map((a) => (a.id === admin.id ? { ...a, validated: true } : a))
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
  const handleDownloadCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Name,Email,UID"]
        .concat(
          admins.map((admin) => `${admin.name},${admin.email},${admin.id}`)
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    saveAs(encodedUri, "admins.csv");
  };

  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = filtered.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const totalPages = Math.ceil(filtered.length / adminsPerPage);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">
          All Admins
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <input
            type="text"
            placeholder="Search by name"
            className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-white dark:border-gray-700" // <<
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FiDownload />
            Download CSV
          </button>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
          {" "}
          {/* << */}
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Spinner />
            </div>
          ) : (
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200">
                <tr>
                  <th className="px-4 py-2 border dark:border-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-2 border dark:border-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-2 border dark:border-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-2 border dark:border-gray-700">
                    Joined
                  </th>
                  <th className="px-4 py-2 border dark:border-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((admin) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleRowClick(admin)}
                  >
                    <td className="px-4 py-2 border dark:border-gray-700">
                      {admin.displayName || admin.name}
                    </td>
                    <td className="px-4 py-2 border dark:border-gray-700">
                      {admin.email}
                    </td>
                    <td className="px-4 py-2 border dark:border-gray-700">
                      {admin.status || "active"}
                    </td>
                    {/* <td className="px-4 py-2 border dark:border-gray-700">{admin.role}</td> */}
                    <td className="px-4 py-2 border dark:border-gray-700">
                      {admin.createdAt?.toDate?.().toLocaleDateString()}
                    </td>
                    <td
                      className="px-4 py-2 border dark:border-gray-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleBlockToggle(admin)}
                          disabled={actionLoading}
                          className={`px-3 py-1 rounded text-sm text-white flex items-center gap-1 transition ${
                            admin.status === "blocked"
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          } 
                          ${
                            actionLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {admin.status === "blocked" ? (
                            <FiUnlock />
                          ) : (
                            <FiLock />
                          )}
                        </button>
                        {!admin.validated && (
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            onClick={() => handleValidate(admin)}
                          >
                            Validate
                          </button>
                        )}
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                          onClick={() => handleDelete(admin)}
                        >
                          <FiDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-700 dark:text-gray-200">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Admin Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedAdmin && (
                <div className="flex gap-4 items-center">
                  <Avatar
                    name={selectedAdmin.name}
                    src={selectedAdmin.profilePic}
                  />
                  <div>
                    <p>
                      <strong>Name:</strong>{" "}
                      {selectedAdmin.displayName || selectedAdmin.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedAdmin.email}
                    </p>
                    <p>
                      <strong>Validated:</strong>
                      {selectedAdmin.validated ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {selectedAdmin.status || "active"}
                    </p>
                    <p>
                      <strong>Joined:</strong>
                      {selectedAdmin.createdAt.toDate
                        ? selectedAdmin.createdAt.toDate().toLocaleString()
                        : ""}
                    </p>
                    <p>
                      <strong>Qualifications:</strong>
                      {selectedAdmin.qualifications}
                    </p>
                    <p>
                      <strong>Subjects/Exams Taught:</strong>
                      {Array.isArray(selectedAdmin.subjects)
                        ? selectedAdmin.subjects.join(", ")
                        : selectedAdmin.subjects}{" "}
                    </p>
                    <p>
                      <strong>Teaching Experience:</strong>{" "}
                      {selectedAdmin.experience}
                    </p>
                    <p>
                      <strong>Phone Number:</strong> {selectedAdmin.phone}
                    </p>
                    {adminStats ? (
                      <>
                        <p>
                          <strong>Bundles Created:</strong>{" "}
                          {adminStats.bundlesCreated}
                        </p>
                        <p>
                          <strong>Revenue:</strong> ₹{adminStats.revenue}
                        </p>
                        <p>
                          <strong>Engagement (Orders):</strong>{" "}
                          {adminStats.engagement}
                        </p>
                      </>
                    ) : (
                      <div className="mt-2">
                        <Spinner size="sm" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
