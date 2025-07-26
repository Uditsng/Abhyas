// "use client";
// import React, { useEffect, useState } from 'react';
// import { sendNotification, getAllNotifications } from '../../../lib/superAdminCommunicationService';
// import { Box, Button, Input, Select, Textarea, Table, Thead, Tbody, Tr, Th, Td, Spinner, Badge, useColorModeValue, Checkbox, useToast } from '@chakra-ui/react';

// export default function SuperAdminCommunicationPage() {
//   const [message, setMessage] = useState('');
//   const [role, setRole] = useState('all');
//   const [to, setTo] = useState('all');
//   const [type, setType] = useState('announcement');
//   const [emailSubject, setEmailSubject] = useState('');
//   const [sendEmail, setSendEmail] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const toast = useToast();

//   // Add color mode values
//   const cardBg = useColorModeValue('blue.100', 'blue.700'); //'white', 'gray.800'
//   const textColor = useColorModeValue('gray.900', 'gray.100');
//   const tableBg = useColorModeValue('blue.200', 'blue.800'); //white, gray.800

//   useEffect(() => {
//     async function fetchNotifications() {
//       setLoading(true);
//       const all = await getAllNotifications();
//       setNotifications(all);
//       setLoading(false);
//     }
//     fetchNotifications();
//   }, []);

//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!message.trim()) return;
    
//     // Validate email subject if email is enabled
//     if (sendEmail && !emailSubject.trim()) {
//       toast({
//         title: 'Email Subject Required',
//         description: 'Please enter an email subject when sending emails.',
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }
//     //Extra added
//     if (type === 'direct' && (!to || to === 'all')) {
//   toast({
//     title: 'Recipient Required',
//     description: 'Please provide a valid user ID for direct messages.',
//     status: 'error',
//     duration: 3000,
//     isClosable: true,
//   });
//   return;
// }

//     setSending(true);
    
    
//     try {
//       const result = await sendNotification({ 
//         to, 
//         role, 
//         message, 
//         type, 
//         emailSubject: sendEmail ? emailSubject : '',
//         sendEmail 
//       });
      
//       // Show success message
//       let successMessage = 'Notification sent successfully!';
//       if (sendEmail) {
//         if (result.emailResult) {
//           successMessage += ` Email sent to ${result.emailResult.recipientCount} recipients.`;
//         } else if (result.emailError) {
//           successMessage += ` Note: Email failed to send - ${result.emailError}`;
//         }
//       }
      
//       toast({
//         title: 'Success',
//         description: successMessage,
//         status: 'success',
//         duration: 5000,
//         isClosable: true,
//       });
      
//       // Reset form
//       setMessage('');
//       setTo('all');
//       setRole('all');
//       setType('announcement');
//       setEmailSubject('');
//       setSendEmail(false);
      
//       // Refresh notifications
//       const all = await getAllNotifications();
//       setNotifications(all);
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to send notification. Please try again.',
//         status: 'error',
//         duration: 5000,
//         isClosable: true,
//       });
//     }
    
//     setSending(false);
//   };

//   return (
//     <Box p={6} mt={8} color={textColor} borderWidth="1px" shadow="md" borderRadius="md" bg={tableBg}>
//       <h2 className="text-2xl font-bold mb-4">Communication & Announcements</h2>
//       <form onSubmit={handleSend} className="mb-8" >
//         <div className="flex flex-col md:flex-row gap-4 mb-4">
//           <Select value={type} onChange={e => setType(e.target.value)} maxW="200px" bg={cardBg} color={textColor}>
//             <option value="announcement">Announcement (Broadcast)</option>
//             <option value="direct">Direct Message</option>
//           </Select>
//           <Select value={role} onChange={e => setRole(e.target.value)} maxW="200px" bg={cardBg} color={textColor}>
//             <option value="all">All Roles</option>
//             <option value="admin">Admins Only</option>
//             <option value="user">Users Only</option>
//           </Select>
//           {type === 'direct' && (
//             <Input placeholder="Recipient User/Admin ID" value={to} onChange={e => setTo(e.target.value)} maxW="300px" bg={cardBg} color={textColor} />
//           )}
//         </div>
//         <Textarea
//           placeholder="Enter your message..."
//           value={message}
//           onChange={e => setMessage(e.target.value)}
//           mb={4}
//           bg={cardBg}
//           color={textColor}
//           size="lg" 
//         />
        
//         {/* Email Options */}
//         <div className="mb-4">
//           <Checkbox 
//             isChecked={sendEmail} 
//             onChange={e => setSendEmail(e.target.checked)}
//             colorScheme="blue"
//             mb={3}
//           >
//             Also send via email
//           </Checkbox>
          
//           {sendEmail && (
//             <Input
//               placeholder="Email subject..."
//               value={emailSubject}
//               onChange={e => setEmailSubject(e.target.value)}
//               bg={cardBg}
//               color={textColor}
//               size="md"
//             />
//           )}
//         </div>
        
//         <Button 
//           type="submit" 
//           colorScheme="blue" 
//           isLoading={sending}
//           loadingText={sendEmail ? "Sending notification & email..." : "Sending notification..."}
//         >
//           {sendEmail ? "Send Notification & Email" : "Send Notification"}
//         </Button>
//       </form>
//       <h3 className="font-semibold mb-2">Sent Notifications & Announcements</h3>
//       {loading ? <Spinner size="lg" /> : (
//         <Table variant="simple" bg={tableBg} borderRadius="md" boxShadow="md">
//           <Thead>
//             <Tr>
//               <Th>Type</Th>
//               <Th>Role</Th>
//               <Th>To</Th>
//               <Th>Message</Th>
//               <Th>Email Status</Th>
//               <Th>Sent At</Th>
//             </Tr>
//           </Thead>
//           <Tbody>
//             {notifications.map(n => (
//               <Tr key={n.id}>
//                 <Td>{n.type === 'announcement' ? <Badge colorScheme="blue">Announcement</Badge> : <Badge colorScheme="purple">Direct</Badge>}</Td>
//                 <Td>{n.role}</Td>
//                 <Td>{n.to}</Td>
//                 <Td>{n.message}</Td>
//                 <Td>
//                   {n.emailSent ? (
//                     <div>
//                       {n.emailStatus === 'sent' && <Badge colorScheme="green">Email Sent</Badge>}
//                       {n.emailStatus === 'failed' && <Badge colorScheme="red">Email Failed</Badge>}
//                       {n.emailStatus === 'pending' && <Badge colorScheme="yellow">Email Pending</Badge>}
//                       {n.emailSubject && (
//                         <div className="text-xs text-gray-500 mt-1">
//                           Subject: {n.emailSubject}
//                         </div>
//                       )}
//                     </div>
//                   ) : (
//                     <Badge variant="outline">Platform Only</Badge>
//                   )}
//                 </Td>
//                 <Td>{n.createdAt && n.createdAt.toDate ? n.createdAt.toDate().toLocaleString() : ''}</Td>
//               </Tr>
//             ))}
//           </Tbody>
//         </Table>
//       )}
//     </Box>
//   );
// }

'use client';

import { useState } from 'react';
import AnnouncementForm from '@/components/SuperAdmin/AnnouncementForm';
import DirectMessageForm from '@/components/SuperAdmin/DirectMessageForm';

export default function CommunicationPage() {
  const [mode, setMode] = useState('announcement');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-center mb-8">Communication Center</h1>


      {/* Radio button selection */}
      <div className="flex gap-6 mb-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="communicationMode"
            value="announcement"
            checked={mode === 'announcement'}
            onChange={() => setMode('announcement')}
          />
          Announcement
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="communicationMode"
            value="direct"
            checked={mode === 'direct'}
            onChange={() => setMode('direct')}
          />
          Direct Message
        </label>
      </div>

      {/* Conditional form rendering */}
      {mode === 'announcement' ? <AnnouncementForm /> : <DirectMessageForm />}
    </div>
  );
}
