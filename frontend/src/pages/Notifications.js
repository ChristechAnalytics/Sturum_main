import React, { useEffect, useState } from "react";
import Header from "../DEPT-components/Header";
import NavbarMP from "../DEPT-components/NavbarMP";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNotification } from "../context/NotificationContext";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_URL from "../config";
import { PAGE_BG } from "../theme/classes";
import UserAvatar from "../components/UserAvatar";

const Notifications = () => {
  const { user } = useAuthContext();
  const { updateNotificationCount } = useNotification();
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.token) {
      fetchFriendRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchFriendRequests = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }

      const userData = await response.json();

      if (userData.friendRequests && userData.friendRequests.length > 0) {
        // Fetch details of users who sent friend requests
        const requestsPromises = userData.friendRequests.map(
          async (requestId) => {
            const reqResponse = await fetch(
              `${API_URL}/api/users/${requestId}`,
              {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              }
            );
            if (reqResponse.ok) {
              return await reqResponse.json();
            }
            return null;
          }
        );

        const requests = await Promise.all(requestsPromises);
        const filteredRequests = requests.filter((r) => r !== null);
        setFriendRequests(filteredRequests);
        updateNotificationCount(filteredRequests.length);
      } else {
        setFriendRequests([]);
        updateNotificationCount(0);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requesterId) => {
    if (!user?.token) return;

    try {
      const response = await fetch(
        `${API_URL}/api/users/accept-friend-request/${requesterId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to accept friend request");
      }

      toast.success("Friend request accepted!");
      // Remove from friend requests
      setFriendRequests((prev) => {
        const updated = prev.filter((req) => req._id !== requesterId);
        updateNotificationCount(updated.length);
        return updated;
      });
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request");
    }
  };

  const handleDeclineRequest = async (requesterId) => {
    if (!user?.token) return;

    try {
      const response = await fetch(
        `${API_URL}/api/users/decline-friend-request/${requesterId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to decline friend request");
      }

      toast.info("Friend request declined");
      // Remove from friend requests
      setFriendRequests((prev) => {
        const updated = prev.filter((req) => req._id !== requesterId);
        updateNotificationCount(updated.length);
        return updated;
      });
    } catch (error) {
      console.error("Error declining friend request:", error);
      toast.error("Failed to decline friend request");
    }
  };

  if (loading) {
    return (
      <div className={PAGE_BG}>
        <Header />
        <NavbarMP />
        <div className="pt-[7rem] sm:pt-[7.125rem] md:pt-[8rem] px-4 sm:px-6 mx-auto max-w-[700px] pb-8">
          <div className="mt-6 sm:mt-8 md:mt-10">
            <p className="text-neutral-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={PAGE_BG}>
      <Header />
      <NavbarMP />
      <div className="pt-[7rem] sm:pt-[7.125rem] md:pt-[8rem] px-4 sm:px-6 mx-auto max-w-[700px] pb-8">
        <ToastContainer />
        <div className="mt-6 sm:mt-8 md:mt-10 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Notifications
          </h1>
        </div>

        {friendRequests.length > 0 ? (
          <div className="space-y-4">
            {friendRequests.map((request) => (
              <div
                key={request._id}
                className="bg-primary-50 border-2 border-primary-100 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center flex-1">
                  <Link to={`/profile/${request._id}`} className="mr-4">
                    <UserAvatar
                      name={request.name}
                      profileImage={request.profileImage}
                      token={user?.token}
                      size={60}
                    />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/profile/${request._id}`}>
                      <h3 className="font-bold text-lg text-neutral-800">{request.name}</h3>
                    </Link>
                    <p className="text-neutral-600">{request.department}</p>
                    <p className="text-sm text-neutral-500">
                      sent you a friend request
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(request._id)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(request._id)}
                    className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-medium px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-500 text-lg">No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
