import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { selectUserData } from "../../reduxSlices/authSlice";
import {
  getTimeFromTimestamp,
  getDateStringFromTimestamp,
} from "../../utilities";
import Avatar from "@material-ui/core/Avatar";
import PhotoRoundedIcon from "@material-ui/icons/PhotoRounded";
import SendRoundedIcon from "@material-ui/icons/SendRounded";
import autosize from "autosize";
import axios from "axios";
import db, { storage } from "../../firebase";
import CircularProgress from "@material-ui/core/CircularProgress";
import io from "socket.io-client";

const socket = io.connect("http://localhost:5000");

const Discussion = () => {
  // Socket IO Connectivity

  const [discussionInput, setDiscussionInput] = useState("");
  const [posts, setPosts] = useState([]);
  console.log("🚀 ~ file: Discussion.jsx:24 ~ Discussion ~ posts:", posts);
  const [fileInput, setFileInput] = useState();
  const userData = useSelector(selectUserData);
  let TextArea = useRef(null);
  let FileInput = useRef(null);
  const storeData = useSelector(selectUserData);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    autosize(TextArea);
  }, [URL]);

  const getDiscussion = async () => {
    setLoading(true);
    await axios
      .post(
        "http://localhost:5000/forum/getDiscussions",
        {},
        { headers: { Authorization: "Bearer " + storeData.token } }
      )
      .then((res) => {
        setPosts(res.data.reverse());
      })
      .catch((err) => console.log(err.response));
    setLoading(false);
  };
  useEffect(() => {
    getDiscussion();
  }, [URL]);

  // Image Preview
  const imgPreview = (e) => {
    console.log(e.target.files[0]);
    setFileInput(e.target.files[0]);
  };

  // Socket Receive Message
  socket.on("messages", (messgaes) => {
    // console.log("messgae is here", messgaes);
    setPosts([...posts, messgaes].reverse());
  });

  const createDiscussion = () => {
    setCreateLoading(true);
    if (fileInput) {
      const fileName = new Date().getTime() + "-" + fileInput.name;
      const uploadTask = storage.ref(`forum/${fileName}`).put(fileInput);
      uploadTask.on("state_changed", console.log, console.error, () => {
        storage
          .ref("forum")
          .child(fileName)
          .getDownloadURL()
          .then((firebaseURL) => {
            return axios.post(
              "http://localhost:5000/forum/createDiscussion",
              {
                creatorEmail: userData.userEmail,
                creatorName: userData.userName,
                desc: discussionInput,
                imgLink: firebaseURL,
              },
              {
                headers: {
                  Authorization: "Bearer " + userData.token,
                },
              }
            );
          })
          .then((res) => {
            console.log(res);
            setDiscussionInput("");
            setFileInput(null);
            getDiscussion();
            autosize(TextArea);
            setCreateLoading(false);
          })
          .catch((err) => {
            console.log(err);
            setDiscussionInput("");
            setFileInput(null);
            autosize(TextArea);
            setCreateLoading(false);
          });
      });
    } else {
      const unixTimestamp = Date.now();

      // Create a new Date object using the Unix timestamp
      const dateObj = new Date(unixTimestamp);

      // Use the Date object's built-in methods to extract the date components
      const year = dateObj.getUTCFullYear();
      const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getUTCDate()).padStart(2, "0");
      const hours = String(dateObj.getUTCHours()).padStart(2, "0");
      const minutes = String(dateObj.getUTCMinutes()).padStart(2, "0");
      const seconds = String(dateObj.getUTCSeconds()).padStart(2, "0");
      const milliseconds = String(dateObj.getUTCMilliseconds()).padStart(
        3,
        "0"
      );

      // Create the formatted date string
      const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;

      socket.emit("msg", {
        _id: "XXXXXX",
        createdAt: formattedDate,
        creatorEmail: userData.userEmail,
        creatorName: userData.userName,
        desc: discussionInput,
      });

      axios
        .post(
          "http://localhost:5000/forum/createDiscussion",
          {
            creatorEmail: userData.userEmail,
            creatorName: userData.userName,
            desc: discussionInput,
          },
          {
            headers: {
              Authorization: "Bearer " + userData.token,
            },
          }
        )
        .then(() => {
          setDiscussionInput("");
          setFileInput(null);
          // getDiscussion();
          autosize(TextArea);
          setCreateLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setDiscussionInput("");
          setFileInput(null);
          autosize(TextArea);
          setCreateLoading(false);
        });
    }
  };

  return (
    <div>
      <div className="Discussion d-flex py-2 px-3 content-box">
        <>
          <div className="Avatar_Container mt-1 mt-md-0">
            <Avatar>
              {storeData.userName && storeData.userName.slice(0, 1)}
            </Avatar>
          </div>
          <div className="Discussion_TextArea d-flex flex-column justify-content-center align-items-center">
            <textarea
              ref={(c) => (TextArea = c)}
              placeholder="Start a discussion, share class materials, etc...."
              rows={1}
              value={discussionInput}
              onChange={(e) => setDiscussionInput(e.target.value)}
            />
            {fileInput ? (
              <div className="Discussion_PreviewImg ms-1 mt-2">
                <img src={URL.createObjectURL(fileInput)} />
              </div>
            ) : null}
          </div>
          <div className="mt-2">
            <PhotoRoundedIcon
              className="InputImgButton"
              style={{ fontSize: "30px" }}
              onClick={() => FileInput.current.click()}
            />
            <input
              accept=".jpeg, .jpg, .png"
              className="Discussion_FileInput"
              type="file"
              ref={FileInput}
              onChange={(e) => imgPreview(e)}
            />
          </div>
          {discussionInput !== "" || fileInput ? (
            <div className="mt-2">
              <SendRoundedIcon
                onClick={createDiscussion}
                className="SendButton"
                style={{ fontSize: "30px" }}
              />
            </div>
          ) : null}
        </>
      </div>
      {createLoading ? (
        <div className="col-12 d-flex justify-content-center align-items-center mt-2">
          <CircularProgress size={50} className="display-block" />
        </div>
      ) : (
        <></>
      )}
      {loading ? (
        <div className="col-12 d-flex justify-content-center align-items-center mt-5">
          <CircularProgress size={50} className="display-block" />
        </div>
      ) : (
        <div className="Posts">
          {posts.map((post) => {
            return (
              <div key={post._id} className="content-box px-3 py-2 my-3">
                <div className="d-flex">
                  <div className="Avatar_Container">
                    <Avatar>{post.creatorName[0]}</Avatar>
                  </div>
                  <div className="Post_Author d-flex flex-column justify-content-center mx-3">
                    <div className="Post_creatorName">{post.creatorName}</div>
                  </div>
                  <div className="d-flex flex-column align-items-end">
                    <div className="Post_UploadDate">
                      {getDateStringFromTimestamp(post.createdAt)}
                    </div>
                    <div className="Post_UploadTime">
                      {getTimeFromTimestamp(post.createdAt)}
                    </div>
                    <div></div>
                  </div>
                </div>
                <div>
                  {post.imgLink ? (
                    <div className="Post_Img">
                      <img src={post.imgLink} alt="" />
                    </div>
                  ) : null}
                  <p className="Post_Desc">{post.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Discussion;
