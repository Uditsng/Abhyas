"use client";

import { useCartStore } from "@/lib/cartStore";
import { FaTrash } from "react-icons/fa";
import {
  Box,
  Flex,
  Text,
  Image,
  Button,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  Stack,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Input,
  Center,
  Spinner
} from "@chakra-ui/react";
import { useRef, useEffect } from "react";
import useRealtimeUserData from "@/hooks/useRealtimeUserData";
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebaseConfig";


export default function CartPage() {
  const [user] = useAuthState(auth);
  const { cartItems, removeFromCart, clearCart } = useCartStore();
  const syncCartFromFirestore = useCartStore(state => state.syncCartFromFirestore);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const tax = +(subtotal * 0.18).toFixed(2);
  const discount = 0;
  const total = subtotal + tax - discount;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const bg = useColorModeValue('gray.50', "gray.900")
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const shadow = useColorModeValue("md", "dark-lg");
  const emptyTextColor = useColorModeValue("gray.500", "gray.400")
  const priceColor = useColorModeValue("green.500", "green.400")
  const summaryBg = useColorModeValue("gray.50", "whiteAlpha.100")
  const disabledCouponColor = useColorModeValue("gray.500", "gray.400")
 



useEffect(() => {
  if (!user?.uid) return;
  syncCartFromFirestore(user.uid);
}, [user?.uid]);

  useEffect(()=>{
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)
    return() =>{
      document.body.removeChild(script)
    }
  }, [])

  const handleRemoveAll = () => {
    clearCart();
    onClose();
  };


const { users, loading } = useRealtimeUserData();

if ( loading) {
  return (
    <Center minH="300px">
      <Spinner mr={2} />
      <Text>Loading user info...</Text>
    </Center>
  );
}


  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    const bundle = cartItems[0]
    const amount = Math.round(total * 100)

    try{
      const res = await fetch("/api/razorpay/order",{
        method:"POST",
        headers:{"Content-Type":"application/JSON"},
        body:JSON.stringify({amount}),
      })
      const order = await res.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name:"ABHYAS",
        description: bundle.title,
        order_id: order.id,
        handler: async function (response){
          await fetch("/api/razorpay/verify",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              user,
              bundle,
              amount,
            })
          })
        },
        prefill:{
          name: user?.displayName || "Guest",
          email:user?.email || "",
          contact: user?.phone || "",
        },
        theme:{
          color:"#3085d6",
        }
      }
      const rzp = new Razorpay(options)
      rzp.open()
    }catch(error){
      console.error("Payment error:", error)
    } 
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bg}
      py={{ base: 8, md: 16 }} px={4}>
      <Box
        w="full"
        maxW="5xl"
        bg={cardBg}
        borderRadius="xl"
        boxShadow={shadow}
        borderWidth={1}
        borderColor={borderColor}
        p={{ base: 4, md: 8 }}
      >
        <Text fontSize="2xl" fontWeight="bold" mb={6}>
          🛒 Your Cart
        </Text>
        {cartItems.length === 0 ? (
          <Box textAlign="center" color={priceColor} py={20} fontSize="lg">
            Your cart is empty 😢
          </Box>
        ) : (
          <Stack direction={{ base: "column", md: "row" }} spacing={8} align="flex-start">
            {/* Cart Items */}
            <VStack align="stretch" flex={2} spacing={4}>
              {cartItems.map((bundle, index) => (
                <Flex
                  key={bundle.id}
                  align="center"
                  borderRadius="none"
                  borderWidth={0}
                  p={2}
                  gap={4}
                  direction={{ base: "column", sm: "row" }}
                >
     
                  <Image
                    src={bundle.imageUrl}
                    alt={bundle.title}
                    objectFit="contain"
                    borderRadius="md"
                    borderWidth={1}
                    borderColor={borderColor}
                    w={{ base: "100px", sm: "140px" }}
                    h={{ base: "60px", sm: "80px" }}
                    bg={bg}
                  />
                  <Box flex={1} minW={0}>
                    <Text fontWeight="semibold" fontSize={{ base: "md", sm: "lg" }} isTruncated>
                      {bundle.title}
                    </Text>
                  </Box>
                  <Text color={priceColor} fontWeight="bold" fontSize={{ base: "md", sm: "lg" }} minW="70px" textAlign="right">
                    ₹{bundle.price}
                  </Text>
                  <Button
                    onClick={() => removeFromCart(bundle.id)}
                    colorScheme="red"
                    variant="ghost"
                    leftIcon={<FaTrash />}
                    size="sm"
                  >
                    Remove
                  </Button>
                </Flex>
              ))}
              {/* Remove All Button at the bottom */}
              {cartItems.length >= 2 && (
                <Box mt={2} textAlign="right">
                  <Button
                    colorScheme="red"
                    variant="outline"
                    size="sm"
                    leftIcon={<FaTrash />}
                    onClick={onOpen}
                  >
                    Remove All
                  </Button>
                </Box>
              )}
            </VStack>
            {/* Cart Summary */}
            <Box
              flex={1}
              w="full"
              maxW="340px"
              bg={bg}
              borderRadius="lg"
              boxShadow="sm"
              borderWidth={1}
              borderColor={borderColor}
              p={6}
              mt={{ base: 4, md: 0 }}
            >
              <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center" bg={summaryBg}>
                Summary
              </Text>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text fontWeight="medium">Subtotal:</Text>
                  <Text fontWeight="bold" color={priceColor}>₹{subtotal}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="medium">Tax (18%):</Text>
                  <Text color="red.300">₹{tax}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="medium" color="yellow.400">Coupon:</Text>
                  <Text color={discount === 0 ? {disabledCouponColor} : "green.500"}>
                  <Input size="sm" placeholder= "Coupon Expired"/>
                  </Text>
                </HStack>  
                <HStack justify="space-between">
                  <Text fontWeight="medium">Discount:</Text>
                  
                  <Text color={discount === 0 ? disabledCouponColor : "green.500"}>
                    {discount === 0 ? "No coupon applied" : `₹${discount}`}
                  </Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontWeight="bold" fontSize="lg">Total:</Text>
                  <Text fontWeight="bold" fontSize="lg" color={priceColor}>₹{total}</Text>
                </HStack>
                <Text fontSize="xs" color={emptyTextColor} textAlign="right">
                  (18% tax included)
                </Text>
                <Button
                  colorScheme="blue"
                  w="full"
                  mt={2}
                  size="md"
                  onClick={handleCheckout}
                  isDisabled={!user || cartItems.length === 0}
                >
                  Buy Now
                </Button>
              </VStack>
            </Box>
            {/* Remove All Confirmation Dialog */}
            <AlertDialog
              isOpen={isOpen}
              leastDestructiveRef={cancelRef}
              onClose={onClose}
              isCentered
            >
              <AlertDialogOverlay> 
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Remove All Items
                  </AlertDialogHeader>
                  <AlertDialogBody>
                    Are you sure you want to remove all items from your cart? This action cannot be undone.
                  </AlertDialogBody>
                  <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                      Cancel
                    </Button>
                    <Button colorScheme="red" onClick={handleRemoveAll} ml={3}>
                      Remove All
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </Stack>
        )}
      </Box>
    </Flex>
  );
}


