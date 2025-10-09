"use client";
import React, { useEffect, useState, useMemo } from 'react';
import {
  getAllPackages,
  createPackage,
  editPackage,
  deletePackage,
  getAllBundlesWithAdminName
} from '../../../lib/superAdminPackagesService';
import { getAllExams } from '../../../lib/superAdminExamsService';
import ImageCropper from "@/components/ImageCropper";
import { FaPlus, FaInfoCircle, FaTimes, FaRupeeSign } from "react-icons/fa";
import { FiEdit, FiSearch, FiDelete, FiPackage,FiUser, FiFileText } from "react-icons/fi";
import {
    Box, Button, Input, Select, Table, Thead, Tbody, Tr, Th, Td, Spinner, Modal,
    ModalOverlay, ModalContent,ModalCloseButton , ModalHeader, ModalBody, ModalFooter, useDisclosure,
    Checkbox, Flex, FormControl, FormLabel, Text, Textarea, useToast, InputGroup,
    InputLeftElement, SimpleGrid, Tag, Stat, StatLabel, StatNumber, Center, IconButton, VStack, HStack, Image, useColorModeValue
} from '@chakra-ui/react';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';

// Main Component
export default function SuperAdminPackagesPage() {
    // State Management
    const [packages, setPackages] = useState([]);
    const [bundles, setBundles] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Main Modal State
    const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
    
    // Bundle Details Modal State
    const { isOpen: isDetailsModalOpen, onOpen: onDetailsModalOpen, onClose: onDetailsModalClose } = useDisclosure();
    
    const [editingPackage, setEditingPackage] = useState(null);
    const [selectedBundleDetails, setSelectedBundleDetails] = useState(null);
    const toast = useToast();

    // Data Fetching
    const fetchData = async () => {
        setLoading(true);
        try {
            const [pkgs, bnds, exms] = await Promise.all([
                getAllPackages(),
                getAllBundlesWithAdminName(),
                getAllExams()
            ]);
            setPackages(pkgs.sort((a, b) => a.name.localeCompare(b.name)));
            setBundles(bnds);
            setExams(exms);
        } catch (error) {
            toast({ title: "Error fetching data", description: error.message, status: "error", duration: 5000, isClosable: true });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handlers
    const handleOpenCreateModal = () => {
        setEditingPackage({
            name: '', price: '', originalPrice: '', exam: '', subExamCategory: '',
            imageUrl: '', description: '', features: '', bundleIds: []
        });
        onEditModalOpen();
    };

    const handleOpenEditModal = (pkg) => {
        setEditingPackage({ ...pkg, features: (pkg.features || []).join('\n') });
        onEditModalOpen();
    };
    
    const handleViewBundleDetails = (bundle) => {
        setSelectedBundleDetails(bundle);
        onDetailsModalOpen();
    };

    const handleDelete = async (pkgId) => {
        if (!window.confirm('Are you sure you want to delete this package? This action cannot be undone.')) return;
        setActionLoading(true);
        try {
            await deletePackage(pkgId);
            toast({ title: "Package Deleted", status: "success", duration: 2000, isClosable: true });
            fetchData();
        } catch (error) {
            toast({ title: "Error deleting package", description: error.message, status: "error", duration: 5000, isClosable: true });
        }
        setActionLoading(false);
    };

    if (loading) {
        return <Center h="80vh"><Spinner size="xl" thickness="4px" color="blue.500" /></Center>;
    }

    return (
        <Box p={{ base: 4, md: 8 }} className="min-h-screen">
                {/* <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="extrabold" className="text-gray-800 dark:text-gray-100">Manage Packages</Text> */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">Manage Packages</h1>
                <div className='flex items-center justify-center mb-2'>
                <Button bg="blue.500" color="white" _hover={{bg: "blue.600"}} leftIcon={<FaPlus />} onClick={handleOpenCreateModal} shadow="md">
                    Create New Package
                </Button>
                </div>

            <Box className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
                <Table variant="simple">
                    <Thead className="bg-gray-50 dark:bg-gray-700">
                        <Tr>
                            <Th>Package Name</Th>
                            <Th>Exam</Th>
                            <Th isNumeric>Price</Th>
                            <Th isNumeric>Bundles</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {packages.map(pkg => (
                            <Tr key={pkg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                <Td>
                                    <HStack>
                                        <Image src={pkg.imageUrl || 'https://placehold.co/40x40/E2E8F0/A0AEC0?text=Pkg'} alt={pkg.name} boxSize="40px" borderRadius="md" objectFit="cover" />
                                        <Text fontWeight="medium">{pkg.name}</Text>
                                    </HStack>
                                </Td>
                                <Td>{pkg.subExamCategory || pkg.exam || 'N/A'}</Td>
                                <Td isNumeric>
                                    <Flex direction="column" align="flex-end">
                                        <Text fontWeight="bold" color="green.500">₹{pkg.price}</Text>
                                        {pkg.originalPrice && <Text as="s" fontSize="xs" color="gray.500">₹{pkg.originalPrice}</Text>}
                                    </Flex>
                                </Td>
                                <Td isNumeric><Tag colorScheme="blue">{pkg.bundleIds?.length || 0}</Tag></Td>
                                <Td>
                                    <Flex gap={2}>
                                       <IconButton icon={<FiEdit />} size="sm" colorScheme="blue" aria-label="Edit" onClick={() => handleOpenEditModal(pkg)} />
                                         <IconButton icon={<FiDelete />} size="sm" colorScheme="red" aria-label="Delete" isLoading={actionLoading} onClick={() => handleDelete(pkg.id)} />
</Flex>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>

            {isEditModalOpen && (
                <CreateEditPackageModal
                    isOpen={isEditModalOpen}
                    onClose={onEditModalClose}
                    pkg={editingPackage}
                    bundles={bundles}
                    exams={exams}
                    onSuccess={fetchData}
                    handleViewBundleDetails={handleViewBundleDetails}
                />
            )}
            
            {selectedBundleDetails && (
                <BundleDetailsModal 
                    isOpen={isDetailsModalOpen}
                    onClose={onDetailsModalClose}
                    bundle={selectedBundleDetails}
                />
            )}
        </Box>
    );
}

// Create/Edit Modal Component
function CreateEditPackageModal({ isOpen, onClose, pkg, bundles, exams, onSuccess, handleViewBundleDetails }) {
    const [formState, setFormState] = useState(pkg);
    const [imageFile, setImageFile] = useState(null);
    const [bundleSearch, setBundleSearch] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const toast = useToast();

    const [discountPercentage, setDiscountPercentage] = useState(0);

    // Logic to automatically calculate original price
    useEffect(() => {
        const total = formState.bundleIds.reduce((sum, id) => {
            const bundle = bundles.find(b => b.id === id);
            return sum + (bundle ? Number(bundle.price) : 0);
        }, 0);
        setFormState(prev => ({ ...prev, originalPrice: total > 0 ? total : '' }));
    }, [formState.bundleIds, bundles]);

    useEffect(() => {
        const original = parseFloat(formState.originalPrice);
        const selling = parseFloat(formState.price);

        if (original > 0 && selling > 0 && selling < original) {
            const percentage = ((original - selling) / original) * 100;
            setDiscountPercentage(percentage.toFixed(0));
        } else {
            setDiscountPercentage(0);
        }
    }, [formState.originalPrice, formState.price]);


    const examCategoryMap = useMemo(() => {
        return exams.reduce((acc, exam) => {
            if (!acc[exam.category]) acc[exam.category] = new Set();
            acc[exam.category].add(exam.subCategory);
            return acc;
        }, {});
    }, [exams]);
    const examCategories = Object.keys(examCategoryMap);
    const subExamOptions = formState.exam ? [...examCategoryMap[formState.exam]] : [];

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleBundleToggle = (bundleId) => {
        setFormState(prev => {
            const bundleIds = prev.bundleIds.includes(bundleId)
                ? prev.bundleIds.filter(id => id !== bundleId)
                : [...prev.bundleIds, bundleId];
            return { ...prev, bundleIds };
        });
    };

    const handleSubmit = async () => {
        setActionLoading(true);
        try {
            let imageUrl = formState.imageUrl;
            if (imageFile) {
                imageUrl = await uploadToCloudinary(imageFile);
            }

            const finalPackageData = {
                ...formState,
                features: formState.features.split('\n').filter(Boolean),
                price: parseFloat(formState.price),
                originalPrice: formState.originalPrice ? parseFloat(formState.originalPrice) : null,
                imageUrl,
            };

            if (formState.id) {
                await editPackage(formState.id, finalPackageData);
                toast({ title: "Package updated successfully!", status: 'success' });
            } else {
                await createPackage(finalPackageData);
                toast({ title: "Package created successfully!", status: 'success' });
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast({ title: "An error occurred", description: error.message, status: 'error' });
        }
        setActionLoading(false);
    };

    const filteredBundles = useMemo(() => {
        return bundles.filter(b => b.title.toLowerCase().includes(bundleSearch.toLowerCase()));
    }, [bundles, bundleSearch]);
    
    const selectedBundles = useMemo(() => {
        return formState.bundleIds.map(id => bundles.find(b => b.id === id)).filter(Boolean);
    }, [formState.bundleIds, bundles]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
            <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
            <ModalContent className="dark:bg-gray-800" mx={4}>
                <ModalHeader>{formState.id ? "Edit" : "Create"} Package</ModalHeader>
                <ModalBody>
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                        {/* Left Side: Form */}
                        <VStack spacing={4} align="stretch">
                            <FormControl isRequired><FormLabel>Package Name</FormLabel><Input name="name" value={formState.name} onChange={handleFormChange} /></FormControl>
                            <SimpleGrid columns={2} spacing={4}>
                                <FormControl isRequired><FormLabel>Price (₹)</FormLabel><Input name="price" type="number" value={formState.price} onChange={handleFormChange} /></FormControl>
                                <FormControl><FormLabel>Original Price (Auto-calculated)</FormLabel><Input name="originalPrice" type="number" value={formState.originalPrice} isReadOnly _readOnly={{bg: useColorModeValue("gray.100", "gray.700")}} placeholder="Auto-calculates..." /></FormControl>
                            
                                <FormControl>
                                    <FormLabel>Discount (%)</FormLabel>
                                    <Input 
                                        name="discount" 
                                        type="text" 
                                        value={discountPercentage > 0 ? `${discountPercentage}% off` : '0%'} 
                                        isReadOnly 
                                        _readOnly={{
                                            bg: useColorModeValue("green.100", "green.800"),
                                            color: useColorModeValue("green.800", "green.200"),
                                            fontWeight: "bold",
                                            textAlign: "center"
                                        }}
                                    />
                                </FormControl>
                                
                            </SimpleGrid>
                            <SimpleGrid columns={2} spacing={4}>
                                <FormControl isRequired><FormLabel>Exam Category</FormLabel><Select name="exam" placeholder="Select Exam" value={formState.exam} onChange={handleFormChange}>{examCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</Select></FormControl>
                                <FormControl isRequired><FormLabel>Sub Exam</FormLabel><Select name="subExamCategory" placeholder="Select Sub Exam" value={formState.subExamCategory} onChange={handleFormChange} isDisabled={!formState.exam}>{subExamOptions.map(sub => <option key={sub} value={sub}>{sub}</option>)}</Select></FormControl>
                            </SimpleGrid>
                            <FormControl><FormLabel>Description</FormLabel><Textarea name="description" value={formState.description} onChange={handleFormChange} /></FormControl>
                            <FormControl><FormLabel>Features (one per line)</FormLabel><Textarea name="features" value={formState.features} onChange={handleFormChange} /></FormControl>
                            <ImageCropper label="Package Poster Image" aspect={16 / 9} onCropComplete={setImageFile} />
                        </VStack>

                        {/* Right Side: Bundle Selector */}
                        <VStack spacing={4} align="stretch" className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                            <Text fontWeight="bold" fontSize="lg">Select Bundles</Text>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none"><FiSearch /></InputLeftElement>
                                <Input placeholder="Search bundles..." value={bundleSearch} onChange={(e) => setBundleSearch(e.target.value)} />
                            </InputGroup>
                            
                            <Box h="200px" overflowY="auto" className="p-2 border dark:border-gray-600 rounded">
                                {filteredBundles.map(bundle => (
                                    <Flex key={bundle.id} justify="space-between" align="center" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                        <Checkbox isChecked={formState.bundleIds.includes(bundle.id)} onChange={() => handleBundleToggle(bundle.id)}>
                                            <VStack align="start" spacing={0} ml={2}>
                                                <Text fontSize="sm" fontWeight="medium">{bundle.title}</Text>
                                                <Text fontSize="xs" color="gray.500">{bundle.adminName} - ₹{bundle.price}</Text>
                                            </VStack>
                                        </Checkbox>
                                        <IconButton icon={<FaInfoCircle />} size="xs" variant="ghost" aria-label="Details" onClick={() => handleViewBundleDetails(bundle)} />
                                    </Flex>
                                ))}
                            </Box>

                            <Text fontWeight="bold">Selected Bundles ({selectedBundles.length})</Text>
                            <Box h="150px" overflowY="auto" className="p-2 border dark:border-gray-600 rounded">
                                {selectedBundles.map(bundle => (
                                     <Flex key={bundle.id} justify="space-between" align="center" className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded mb-1">
                                       <Text fontSize="sm" fontWeight="medium">{bundle.title}</Text>
                                       <IconButton icon={<FaTimes />} size="xs" variant="ghost" colorScheme="red" aria-label="Remove" onClick={() => handleBundleToggle(bundle.id)} />
                                     </Flex>
                                ))}
                            </Box>
                        </VStack>
                    </SimpleGrid>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button colorScheme="blue" ml={3} onClick={handleSubmit} isLoading={actionLoading}>
                        {formState.id ? "Save Changes" : "Create Package"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

// Bundle Details Modal
function BundleDetailsModal({ isOpen, onClose, bundle }) {
    if (!bundle) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
            <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
            <ModalContent className="dark:bg-gray-800 rounded-xl">
                <ModalHeader borderTopRadius="xl" bg={useColorModeValue("gray.50", "gray.700")} borderBottomWidth="1px" borderColor={useColorModeValue("gray.200", "gray.600")}>{bundle.title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody p={6}>
                    <VStack align="stretch" spacing={5}>
                        <HStack justify="space-between">
                           <Stat>
                               <StatLabel display="flex" alignItems="center" color="gray.500"><FiUser mr={2}/> Admin</StatLabel>
                               <StatNumber>{bundle.adminName}</StatNumber>
                           </Stat>
                           <Stat textAlign="right">
                               <StatLabel display="flex" alignItems="center" justifyContent="flex-end" color="gray.500"><FaRupeeSign mr={2}/> Price</StatLabel>
                               <StatNumber>₹{bundle.price}</StatNumber>
                           </Stat>
                           <Stat textAlign="right">
                               <StatLabel display="flex" alignItems="center" justifyContent="flex-end" color="gray.500"><FiFileText mr={2}/> Tests</StatLabel>
                               <StatNumber>{bundle.testIds?.length || 0}</StatNumber>
                           </Stat>
                        </HStack>
                        <Box>
                            <Text fontWeight="bold" mb={2}>Description:</Text>
                            <Text fontSize="sm" p={3} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="md">{bundle.description || 'No description provided.'}</Text>
                        </Box>
                    </VStack>
                </ModalBody>
                <ModalFooter borderBottomRadius="xl" bg={useColorModeValue("gray.50", "gray.700")} borderTopWidth="1px" borderColor={useColorModeValue("gray.200", "gray.600")}>
                    <Button onClick={onClose} variant="outline">Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

