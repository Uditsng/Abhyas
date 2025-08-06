import { useEffect, useRef, useState } from "react";
import {
  Box,
  IconButton,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaBell } from "react-icons/fa";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "./AuthContext";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeen, setLastSeen] = useState(null);
  const audioRef = useRef(null);

  const menuBg = useColorModeValue("white", "gray.800");
  const menuColor = useColorModeValue("gray.900", "gray.100");

  // Fetch notifications
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // Announcements for all or for this role
    const q1 = query(
      collection(db, "notifications"),
      where("role", "in", ["all", user.role]),
      orderBy("createdAt", "desc")
    );
    // Direct messages to this user
    const q2 = query(
      collection(db, "notifications"),
      where("to", "==", user.email),
      orderBy("createdAt", "desc")
    );

    let announcements = [];
    let directMessages = [];
    // Listen for real-time updates
    const unsub1 = onSnapshot(q1, (snap1) => {
      announcements = snap1.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      updateCombinedNotifications();
    });

    const unsub2 = onSnapshot(q2, (snap2) => {
      directMessages = snap2.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        direct: true,
      }));
      updateCombinedNotifications();
    });

    const updateCombinedNotifications = () => {
      const all = [...announcements, ...directMessages];

      // Deduplicate by ID
      const unique = Array.from(
        new Map(all.map((item) => [item.id, item])).values()
      );

      const sorted = unique.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date();
        const bDate = b.createdAt?.toDate?.() || new Date();
        return bDate - aDate;
      });

      setNotifications(sorted);
      setLoading(false);
    };

    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  // Play sound on new notification
  useEffect(() => {
    if (!notifications.length) return;
    if (!lastSeen) {
      setLastSeen(Date.now());
      return;
    }
    // If a new notification is newer than lastSeen, play sound
    const latest = notifications[0].createdAt?.toDate?.() || new Date();
    if (latest > lastSeen) {
      if (audioRef.current) audioRef.current.play();
      setLastSeen(latest);
    }
    // Count unread (all for now)
    setUnreadCount(notifications.length);
  }, [notifications]);

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={<FaBell />}
        variant="ghost"
        size="lg"
        position="relative"
      >
        {unreadCount > 0 && (
          <Badge
            colorScheme="red"
            position="absolute"
            top="1"
            right="1"
            borderRadius="full"
            fontSize="0.7em"
          >
            {unreadCount}
          </Badge>
        )}
      </MenuButton>
      <MenuList
        bg={menuBg}
        color={menuColor}
        maxH="350px"
        overflowY="auto"
        minW="340px"
      >
        <Box
          px={4}
          py={2}
          borderBottom="1px solid"
          borderColor={useColorModeValue("gray.200", "gray.700")}
        >
          <Text fontWeight="bold">Notifications</Text>
        </Box>
        {loading ? (
          <Box p={4} textAlign="center">
            <Spinner size="sm" />
          </Box>
        ) : notifications.length === 0 ? (
          <Box p={4} textAlign="center" color="gray.500">
            No notifications
          </Box>
        ) : (
          notifications.map((n) => (
            <MenuItem key={n.id}>
              <Box>
                <Text fontSize="sm" fontWeight="bold">
                  {n.type === "announcement" ? "Announcement" : "Direct"}
                </Text>
                <Text fontSize="sm">{n.message}</Text>
                <Text fontSize="xs" color="gray.500">
                  {n.createdAt && n.createdAt.toDate
                    ? n.createdAt.toDate().toLocaleString()
                    : ""}
                </Text>
              </Box>
            </MenuItem>
          ))
        )}
      </MenuList>
    </Menu>
  );
}
