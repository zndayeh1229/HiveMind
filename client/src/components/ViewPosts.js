import React, { Fragment, useEffect, useState } from "react";
import { slide as Menu } from "react-burger-menu";
import { toast } from "react-toastify";
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient'
import logoutIcon from '../images/logout.png';
import '@react-pdf-viewer/core/lib/styles/index.css';
import './Dashboard.css'
import hivemindLogo from '../images/spacebee.png';
import { useContext } from "react";
import { ClassContext } from "../contexts/ClassContext";


const ViewPosts = ({ setAuth }) => {
    const [name, setUsername] = useState("");
    const [media, setMedia] = useState([[]]);
    const [loadingVotes, setLoadingVotes] = useState({});


    const { classId } = useContext(ClassContext);

    console.log("Class ID in viewposts:", classId);

    const fetchPosts = async () => {
        try {
            const response = await fetch(`http://localhost:5000/view-posts/?classID=${classId}`, {
                method: "GET",
                headers: { token: localStorage.token },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch posts");
            }

            const postData = await response.json();
            const votesResponse = await fetch("http://localhost:5000/votes", {
                method: "GET",
                headers: { token: localStorage.token },
            });

            if (!votesResponse.ok) {
                throw new Error("Failed to fetch user votes");
            }


            const userVotes = await votesResponse.json();

            const updatedPosts = postData.map((post) => {
                const userVote = userVotes.find((vote) => vote.post_id === post.file_name);
                return {
                    ...post,
                    userVote: userVote ? userVote.vote_type : null, // 'upvote' or 'downvote'
                };
            });

            setMedia(updatedPosts);

        } catch (err) {
            console.error("Error fetching posts:", err.message);
        }
    };

    const handleDownload = async (post) => {
        setLoadingVotes((prev) => ({ ...prev, [post.file_name]: true }));
        try {
            // console.log(post.course_id);
            // console.log(post.file_name);
            const response = await fetch(
                `http://localhost:5000/download/${post.course_id}/${post.file_name}`,
                {
                    method: "GET",
                    headers: { token: localStorage.token }, // Include auth token if needed
                }
            );

            if (!response.ok) {
                throw new Error("Failed to download file");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = post.post_title || "download";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed", err);
        } finally {
            setLoadingVotes((prev) => ({ ...prev, [post.file_name]: false }));
        }
    };

    const handleUpvote = async (post) => {
        setLoadingVotes((prev) => ({ ...prev, [post.file_name]: true }));
        try {
            const response = await fetch(
                "http://localhost:5000/votes/upvote",
                {
                    method: "POST",
                    headers: {
                        token: localStorage.token,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ postID: post.file_name }),
                });

            if (!response.ok) {
                throw new Error("Failed to cast upvote");
            }

            const { votes } = await response.json();
            setMedia((prevMedia) =>
                prevMedia.map((item) =>
                    item.file_name === post.file_name
                        ? { ...item, votes, userVote: "upvote" }
                        : item
                )
            );

        } catch (err) {
            console.error("Voting failed", err);
            setMedia((prevMedia) =>
                prevMedia.map((item) =>
                    item.file_name === post.file_name
                        ? { ...item, votes: item.votes - 1, userVote: null }
                        : item
                )
            );
        } finally {
            setLoadingVotes((prev) => ({ ...prev, [post.file_name]: false }));
        }
    };

    const handleDownvote = async (post) => {
        setLoadingVotes((prev) => ({ ...prev, [post.file_name]: true }));
        try {
            const response = await fetch(
                "http://localhost:5000/votes/downvote",
                {
                    method: "POST",
                    headers: {
                        token: localStorage.token,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ postID: post.file_name }),
                });

            if (!response.ok) {
                throw new Error("Failed to cast downvote");
            }

            const { votes } = await response.json();
            setMedia((prevMedia) =>
                prevMedia.map((item) =>
                    item.file_name === post.file_name
                        ? { ...item, votes, userVote: "downvote" }
                        : item
                )
            );

        } catch (err) {
            console.error("Voting failed", err);
            setMedia((prevMedia) =>
                prevMedia.map((item) =>
                    item.file_name === post.file_name
                        ? { ...item, votes: item.votes + 1, userVote: null }
                        : item
                )
            );
        } finally {
            setLoadingVotes((prev) => ({ ...prev, [post.file_name]: false }));
        }
    };

    const getName = async () => {
        console.log("getName called");
        try {
            const response = await fetch("http://localhost:5000/dashboard/",
                {
                    method: "GET",
                    headers: { token: localStorage.token }
                });

            const parseData = await response.json();
            console.log("Fetched name:", parseData.username);
            setUsername(parseData.username);
        } catch (err) {
            console.error(err.message);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setAuth(false);
        toast.success("Logged out successfully!", { pauseOnHover: false });
    };

    useEffect(() => {
        getName();
    }, []);

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <Fragment>
            <div>

                <div className="dark-overlay"></div>
                <div className="dashboard-logo"><img src={hivemindLogo} alt="Hivemind Logo" className="dashboard-logo" /> </div>

                <div className="dashboard-container">
                    <div className="burger-menu-container">
                        <Menu>
                            <div className="bm-item-list">
                                <Link to="/dashboard">Home</Link>
                                <a onClick={logout} style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={logoutIcon} alt="Logout Icon" style={{ marginRight: '5px', verticalAlign: 'middle', width: '24px', height: '24px' }} />
                                    Logout
                                </a>
                            </div>
                        </Menu>
                    </div>

                    <header>
                        <h1 className="dashboard-header-left font-tiny5 font-bold text-left text-white text-7xl heading-shadow">HiveMind</h1>
                    </header>

                    <h2 className="dashboard-header-right font-tiny5 font-bold text-left text-white text-3xl heading-shadow">
                        <Link to="/profile" className="text-white">{name}</Link>
                    </h2>
                </div>
                <div className="posts-container">
                    <Link to="/create-post">
                        <button className="font-dotgothic custom-button">Add a Post</button>
                    </Link>
                    <h1 className="font-tiny5 font-bold text-left text-white text-7xl heading-shadow">
                        Class Example
                    </h1>
                    {media.length === 0 ? (
                        <p>No posts available</p>
                    ) : (
                        <ul className="posts-list">
                            {media.map((item, index) => {
                                return (
                                    <li key={index} className="post-item">
                                        <h2 className="font-dotgothic text-white text-2xl">{item.post_title}</h2>
                                        <p className="font-dotgothic text-gray-400">{item.username}</p>
                                        <p className="font-dotgothic text-gray-400">{new Date(item.created_at).toLocaleString()}</p>
                                        {item.file_url && (
                                            <div>
                                                {item.file_type.startsWith("image/") && (
                                                    <img
                                                        src={item.file_url}
                                                        alt={item.post_title}
                                                        className="post-image"
                                                    />
                                                )}
                                                {item.file_type === "application/pdf" && (
                                                    <iframe
                                                        src={item.file_url}
                                                        title={item.post_title}
                                                        className="post-pdf"
                                                    />
                                                )}
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <button
                                                        onClick={() => handleUpvote(item)}
                                                        disabled={loadingVotes[item.file_name]}
                                                        className={`p-2 border rounded-full ${item.userVote === "upvote" ? "bg-green-500 text-white" : "hover:bg-gray-100"
                                                            }`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownvote(item)}
                                                        disabled={loadingVotes[item.file_name]}
                                                        className={`p-2 border rounded-full ${item.userVote === "downvote" ? "bg-red-500 text-white" : "hover:bg-gray-100"
                                                            }`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>

                                                </div>
                                                <a
                                                    onClick={() => handleDownload(item)}
                                                    className={`download-button ${loadingVotes[item.file_name] ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    style={{
                                                        cursor: loadingVotes[item.file_name] ? "not-allowed" : "pointer",
                                                        marginTop: "10px",
                                                        display: "block",
                                                    }}
                                                    disabled={loadingVotes[item.file_name]} // Optional
                                                >
                                                    {loadingVotes[item.file_name] ? "Downloading..." : "Download"}
                                                </a>
                                            </div>
                                        )}
                                        {!item.file_url && (
                                            <p className="text-red-500">Media file not found</p>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </Fragment>
    );
};

export default ViewPosts;