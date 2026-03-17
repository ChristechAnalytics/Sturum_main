import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import Header from "../DEPT-components/Header";
import NavbarMP from "../DEPT-components/NavbarMP";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserPlus, FaCheck, FaSpinner } from "react-icons/fa";

const Discover = () => {
  const { user } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingRequests, setSendingRequests] = useState(new Set());
  const [sentRequests, setSentRequests] = useState(new Set());
  const [friends, setFriends] = useState(new Set());

  const fetchCurrentUserStatus = useCallback(async (usersList) => {
    if (!user?.token || !usersList || usersList.length === 0) return;

    try {
      // Get current user's data
      const currentUserResponse = await fetch("http://localhost:4000/api/users/me", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!currentUserResponse.ok) return;

      const currentUserData = await currentUserResponse.json();
      const currentUserId = currentUserData._id?.toString();
      
      if (!currentUserId) return;

      const sentRequestsSet = new Set();
      const friendsSet = new Set();
      
      // Add friends and connections to set
      if (currentUserData.friends) {
        currentUserData.friends.forEach(friendId => {
          friendsSet.add(friendId.toString());
        });
      }
      
      if (currentUserData.connections) {
        currentUserData.connections.forEach(connId => {
          friendsSet.add(connId.toString());
        });
      }

      setFriends(friendsSet);

      // Check each discoverable user to see if we've sent them a request
      const requestsPromises = usersList.map(async (discoverUser) => {
        try {
          const userResponse = await fetch(
            `http://localhost:4000/api/users/${discoverUser._id}`,
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.friendRequests?.some(
              (reqId) => reqId.toString() === currentUserId
            )) {
              sentRequestsSet.add(discoverUser._id.toString());
            }
          }
        } catch (error) {
          console.error("Error checking user status:", error);
        }
      });
      
      await Promise.all(requestsPromises);
      setSentRequests(sentRequestsSet);
    } catch (error) {
      console.error("Error fetching current user status:", error);
    }
  }, [user?.token]);

  const fetchDiscoverableUsers = useCallback(async () => {
    if (!user?.token) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/users/discover", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      const fetchedUsers = data.users || [];
      setUsers(fetchedUsers);
      
      // After fetching users, check their status
      await fetchCurrentUserStatus(fetchedUsers);
    } catch (error) {
      console.error("Error fetching discoverable users:", error);
      toast.error(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [user?.token, fetchCurrentUserStatus]);

  useEffect(() => {
    if (user?.token) {
      fetchDiscoverableUsers();
    }
  }, [user, fetchDiscoverableUsers]);

  const handleSendFriendRequest = async (userId) => {
    if (!user?.token || sendingRequests.has(userId)) return;

    setSendingRequests((prev) => new Set(prev).add(userId));

    try {
      const response = await fetch(
        `http://localhost:4000/api/users/friend-request/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to send friend request");
      }

      if (data.autoAccepted) {
        toast.success("Friend request accepted! You are now friends.");
        setFriends((prev) => new Set(prev).add(userId));
        setSentRequests((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        // Remove user from discoverable list since they're now a friend
        setUsers((prev) => prev.filter((u) => u._id.toString() !== userId));
      } else {
        toast.success("Friend request sent successfully!");
        setSentRequests((prev) => new Set(prev).add(userId));
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error(error.message || "Failed to send friend request");
    } finally {
      setSendingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const isFriend = (userId) => {
    return friends.has(userId.toString());
  };

  const hasSentRequest = (userId) => {
    return sentRequests.has(userId.toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50">
      <Header />
      <NavbarMP />
      <div className="pt-[7rem] sm:pt-[7.125rem] md:pt-[8rem] px-4 sm:px-6 mx-auto max-w-7xl pb-8">
        <ToastContainer />
        
        <div className="mt-6 sm:mt-8 md:mt-10 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Discover Friends
          </h1>
          <p className="text-neutral-600">
            Find and connect with people in your department
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="text-4xl text-primary-600 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md border-2 border-neutral-200">
            <p className="text-neutral-500 text-lg mb-2">No users to discover</p>
            <p className="text-neutral-400 text-sm">
              You've connected with everyone in your department!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((discoverUser) => {
              const userId = discoverUser._id.toString();
              const isAlreadyFriend = isFriend(userId);
              const requestSent = hasSentRequest(userId);
              const isSending = sendingRequests.has(userId);

              return (
                <div
                  key={discoverUser._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-2 border-neutral-200 hover:border-primary-300 p-6"
                >
                  <div className="flex flex-col items-center">
                    <Link
                      to={`/profile/${discoverUser._id}`}
                      className="flex flex-col items-center mb-4"
                    >
                      <div className="w-20 h-20 rounded-full border-4 border-primary-200 overflow-hidden mb-3 bg-neutral-100">
                        <img
                          src={
                            discoverUser.profileImage
                              ? `http://localhost:4000${discoverUser.profileImage}`
                              : ""
                          }
                          alt={discoverUser.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-800 text-center mb-1">
                        {discoverUser.name}
                      </h3>
                      <p className="text-sm text-neutral-600 text-center mb-1">
                        {discoverUser.department}
                      </p>
                      <p className="text-xs text-neutral-500 text-center">
                        Level{" "}
                        {discoverUser.academicLevel === 600
                          ? "Graduate"
                          : discoverUser.academicLevel}
                      </p>
                    </Link>

                    <div className="mt-4 w-full">
                      {isAlreadyFriend ? (
                        <div className="text-center">
                          <div className="flex items-center justify-center text-primary-600 font-semibold mb-2">
                            <FaCheck className="mr-2" />
                            Already Friends
                          </div>
                          <Link
                            to="/messaging"
                            className="text-primary-600 hover:text-primary-700 text-sm underline"
                          >
                            Send a message
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSendFriendRequest(discoverUser._id)}
                          disabled={requestSent || isSending}
                          className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                          {isSending ? (
                            <>
                              <FaSpinner className="animate-spin" />
                              Sending...
                            </>
                          ) : requestSent ? (
                            <>
                              <FaCheck />
                              Request Sent
                            </>
                          ) : (
                            <>
                              <FaUserPlus />
                              Send Request
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
