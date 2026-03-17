import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import Header from "../DEPT-components/Header";
import NavbarMP from "../DEPT-components/NavbarMP";

const Profile = () => {
  const { id } = useParams();
  const { user, dispatch } = useAuthContext();
  const [userInfo, setUserInfo] = useState(null);
  const [contact, setContact] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [message, setMessage] = useState("");
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [isAlreadyFriend, setIsAlreadyFriend] = useState(false);
  const [isLoadingRequest, setIsLoadingRequest] = useState(false);

  // Fetch user info when component mounts or user/id changes
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!user || !user.token) {
          throw new Error("User is not authenticated");
        }

        const response = await fetch(`http://localhost:4000/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user info: ${response.statusText}`);
        }

        const data = await response.json();
        setUserInfo(data);
        setContact(data.contact || "");
        // Convert 600 to "graduate" for display, otherwise use the number as string
        setAcademicLevel(data.academicLevel === 600 ? "graduate" : (data.academicLevel?.toString() || ""));
        setProfileImage(data.profileImage || null);
      } catch (error) {
        console.error("Error fetching user info:", error.message);
      }
    };

    fetchUserInfo();
  }, [user, id]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (!user || !user.token) {
        throw new Error("User is not authenticated");
      }

      const formData = new FormData();
      formData.append("contact", contact);
      formData.append("academicLevel", academicLevel);
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await fetch(`http://localhost:4000/api/users/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }

      const updatedUser = await response.json();
      setUserInfo(updatedUser);
      setMessage("Profile updated successfully");
      dispatch({ type: "UPDATE_PROFILE", payload: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error.message);
      setMessage("Failed to update profile");
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  // Check friend request status
  const checkFriendRequestStatus = async () => {
    if (!user?.token || !id) return;
    
    try {
      // Check current user's friend requests and connections
      const currentUserResponse = await fetch("http://localhost:4000/api/users/me", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (!currentUserResponse.ok) return;
      
      const currentUserData = await currentUserResponse.json();
      
      // Check if already friends or connected
      const isFriend = currentUserData.friends?.some(
        (friendId) => friendId.toString() === id
      ) || currentUserData.connections?.some(
        (connId) => connId.toString() === id
      );
      
      if (isFriend) {
        setIsAlreadyFriend(true);
        return;
      }
      
      // Check if friend request already sent (check if this user is in current user's sent requests)
      // We check by seeing if the profile user has current user in their friendRequests
      const profileUserResponse = await fetch(`http://localhost:4000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (profileUserResponse.ok) {
        const profileUserData = await profileUserResponse.json();
        const requestSent = profileUserData.friendRequests?.some(
          (reqId) => reqId.toString() === (user._id || user.userId)?.toString()
        );
        
        if (requestSent) {
          setFriendRequestSent(true);
        }
      }
    } catch (error) {
      console.error("Error checking friend request status:", error);
    }
  };

  // Handle friend request
  const handleSendFriendRequest = async () => {
    if (!user?.token || friendRequestSent || isAlreadyFriend) return;
    
    setIsLoadingRequest(true);
    setMessage("");
    
    try {
      const response = await fetch(
        `http://localhost:4000/api/users/friend-request/${id}`,
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
      
      // Check if auto-accepted
      if (data.autoAccepted) {
        setMessage("Friend request accepted! You are now friends.");
        setIsAlreadyFriend(true);
        setFriendRequestSent(false);
      } else {
        setMessage("Friend request sent successfully!");
        setFriendRequestSent(true);
      }
    } catch (error) {
      console.error("Error sending friend request:", error.message);
      setMessage(error.message || "Failed to send friend request");
    } finally {
      setIsLoadingRequest(false);
    }
  };

  // Check if the logged-in user is viewing their own profile
  // First try to get user ID from /me endpoint
  const [currentUserId, setCurrentUserId] = useState(null);
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!user?.token) return;
      try {
        const response = await fetch("http://localhost:4000/api/users/me", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data._id);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchCurrentUser();
  }, [user]);

  const isOwnProfile = currentUserId === id || (user && (user.userId === id || user._id === id));

  // Check friend request status when user info and current user are loaded
  useEffect(() => {
    if (userInfo && currentUserId && !isOwnProfile && user?.token) {
      checkFriendRequestStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo, currentUserId, isOwnProfile, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50">
      <Header />
      <NavbarMP />
      <div className="pt-[7rem] sm:pt-[7.125rem] md:pt-[8rem] px-4 sm:px-6 pb-8">
        <div className="profile-container max-w-2xl mx-auto my-6 sm:my-10 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border-2 border-neutral-200">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="flex justify-center items-center w-32 h-32 sm:w-40 sm:h-40 border-4 border-primary-400 rounded-full bg-neutral-100 text-center shadow-lg">
                <img
                  className="rounded-full object-cover w-full h-full"
                  src={
                    userInfo?.profileImage
                      ? `http://localhost:4000${userInfo.profileImage}`
                      : ""
                  }
                  alt={`${userInfo?.name || 'User'}'s profile`}
                />
              </div>
            </div>
          </div>

          {userInfo ? (
            <>
              <h2 className="text-center text-2xl sm:text-3xl font-bold my-4 text-neutral-800">
                {userInfo.name}
              </h2>
              <div className="text-center text-neutral-600 space-y-2 mb-6">
                <p className="text-sm sm:text-base">
                  <span className="font-semibold text-neutral-700">Department:</span>{" "}
                  {userInfo.department}
                </p>
                <p className="text-sm sm:text-base">
                  <span className="font-semibold text-neutral-700">Email:</span> {userInfo.email}
                </p>
                {userInfo.contact && (
                  <p className="text-sm sm:text-base">
                    <span className="font-semibold text-neutral-700">Contact:</span>{" "}
                    {userInfo.contact}
                  </p>
                )}
                {userInfo.academicLevel && (
                  <p className="text-sm sm:text-base">
                    <span className="font-semibold text-neutral-700">Academic Level:</span>{" "}
                    {userInfo.academicLevel === 600 ? "Graduate" : userInfo.academicLevel}
                  </p>
                )}
              </div>

              <div className="border-b-2 border-neutral-300 my-5"></div>

              {isOwnProfile ? (
                <form onSubmit={handleUpdateProfile} className="mt-6">
                  <p className="text-center font-bold mb-6 text-xl text-neutral-800">Update Profile</p>
                  <div className="mb-4">
                    <label
                      className="block text-neutral-700 text-sm font-semibold mb-2"
                      htmlFor="contact"
                    >
                      Contact
                    </label>
                    <input
                      type="tel"
                      id="contact"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      placeholder="Enter your contact number"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      className="block text-neutral-700 text-sm font-semibold mb-2"
                      htmlFor="academicLevel"
                    >
                      Academic Level
                    </label>
                    <select
                      id="academicLevel"
                      value={academicLevel === 600 ? "graduate" : academicLevel?.toString() || ""}
                      onChange={(e) => setAcademicLevel(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                    >
                      <option value="">Select Academic Level</option>
                      <option value="100">100 Level</option>
                      <option value="200">200 Level</option>
                      <option value="300">300 Level</option>
                      <option value="400">400 Level</option>
                      <option value="500">500 Level</option>
                      <option value="graduate">Graduate</option>
                    </select>
                  </div>
                  <div className="mb-6">
                    <label
                      className="block text-neutral-700 text-sm font-semibold mb-2"
                      htmlFor="profileImage"
                    >
                      Profile Image
                    </label>
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Save Changes
                    </button>
                  </div>

                  {message && (
                    <div
                      className={`mt-4 text-center font-bold ${
                        message.includes("successfully")
                          ? "text-primary-600"
                          : "text-red-500"
                      }`}
                    >
                      {message}
                    </div>
                  )}
                </form>
              ) : (
                <div className="flex flex-col items-center mt-6">
                  {isAlreadyFriend ? (
                    <div className="text-center">
                      <p className="text-primary-600 font-semibold mb-2">✓ You are friends</p>
                      <Link
                        to="/messaging"
                        className="text-primary-600 hover:text-primary-700 underline"
                      >
                        Send a message
                      </Link>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleSendFriendRequest}
                        disabled={friendRequestSent || isLoadingRequest}
                        className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        {isLoadingRequest
                          ? "Sending..."
                          : friendRequestSent
                          ? "Friend Request Sent ✓"
                          : "Send Friend Request"}
                      </button>
                      {message && (
                        <div
                          className={`mt-4 text-center text-sm font-medium ${
                            message.includes("successfully") || message.includes("accepted")
                              ? "text-primary-600"
                              : "text-red-500"
                          }`}
                        >
                          {message}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center pt-5 font-medium">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
