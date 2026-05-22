import React, { useEffect, useState } from "react";
import Header from "../DEPT-components/Header";
import NavbarMP from "../DEPT-components/NavbarMP";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNotification } from "../context/NotificationContext";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_URL from "../config";
import UserAvatar from "../components/UserAvatar";

const MyNetwork = () => {
  const { user } = useAuthContext();
  const { updateNotificationCount } = useNotification();
  const [friendRequests, setFriendRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriendRequests();
    fetchConnections();
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
        const requestsPromises = userData.friendRequests.map(async (requestId) => {
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
        });

        const requests = await Promise.all(requestsPromises);
        setFriendRequests(requests.filter((r) => r !== null));
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      toast.error("Failed to load friend requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch(
        `${API_URL}/api/users/connections`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch connections");
      }

      const data = await response.json();
      setConnections(data.connections || []);
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast.error("Failed to load connections");
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
      // Remove from friend requests and add to connections
      setFriendRequests((prev) => {
        const updated = prev.filter((req) => req._id !== requesterId);
        updateNotificationCount(updated.length);
        return updated;
      });
      // Refresh connections
      fetchConnections();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50">
        <Header />
        <NavbarMP />
        <div className="pt-[7rem] sm:pt-[7.125rem] md:pt-[8rem] px-4 sm:px-6 mx-auto max-w-7xl pb-8">
          <div className="mt-6 sm:mt-8 md:mt-10">
            <p className="text-neutral-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50">
      <Header />
      <NavbarMP />
      <div className="pt-[7rem] sm:pt-[7.125rem] md:pt-[8rem] px-4 sm:px-6 mx-auto max-w-7xl pb-8">
        <ToastContainer />
        <div className="mt-6 sm:mt-8 md:mt-10 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">My Network</h1>
        </div>

        {/* Friend Requests Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-neutral-800">Friend Requests</h2>
          {friendRequests.length > 0 ? (
            <div className="space-y-4">
              {friendRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-primary-50 border-2 border-primary-100 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center">
                    <Link to={`/profile/${request._id}`} className="mr-4">
                      <UserAvatar
                        name={request.name}
                        profileImage={request.profileImage}
                        token={user?.token}
                        size={60}
                      />
                    </Link>
                    <div>
                      <Link to={`/profile/${request._id}`}>
                        <h3 className="font-bold text-lg text-neutral-800">{request.name}</h3>
                      </Link>
                      <p className="text-neutral-600">{request.department}</p>
                      <p className="text-sm text-neutral-500">
                        Level {request.academicLevel === 600 ? "Graduate" : request.academicLevel}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcceptRequest(request._id)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No pending friend requests</p>
          )}
        </div>

        {/* Connections Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-neutral-800">My Connections</h2>
          {connections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((connection) => (
                <Link
                  key={connection._id}
                  to={`/profile/${connection._id}`}
                  className="bg-primary-50 rounded-lg p-4 flex items-center hover:bg-primary-100 border-2 border-transparent hover:border-primary-200 transition-all shadow-sm hover:shadow-md"
                >
                  <UserAvatar
                    name={connection.name}
                    profileImage={connection.profileImage}
                    token={user?.token}
                    size={60}
                    className="mr-4 border-2 border-primary-200"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-neutral-800">{connection.name}</h3>
                    <p className="text-neutral-600">{connection.department}</p>
                    <p className="text-sm text-neutral-500">
                      Level {connection.academicLevel === 600 ? "Graduate" : connection.academicLevel}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No connections yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyNetwork;
