import React, { useState, useEffect, useRef } from "react";
import autosize from "autosize";
import PermIdentityIcon from "@material-ui/icons/PermIdentity";
import CircularProgress from "@material-ui/core/CircularProgress";
import PictureAsPdfIcon from "@material-ui/icons/PictureAsPdf";
import AssignmentIcon from "@material-ui/icons/Assignment";
import ClassIcon from '@material-ui/icons/Class';
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import clsx from "clsx";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import { makeStyles } from "@material-ui/core/styles";
import { Modal, ModalBody } from "reactstrap";
import "./CreateResource.css";

import db, { storage } from "../../firebase";
import axios from "axios";

import { useSelector } from "react-redux";
import { selectUserData } from "../../reduxSlices/authSlice";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "10px",
    "& .MuiInputLabel-formControl ": {
      top: "-6px",
      fontSize: "18px",
      color: "gray",
      // fontWeight: 'bold'
    },
    "& .MuiInputBase-input::placeholder": {
      fontSize: "14px",
    },
    "& .MuiFormLabel-filled": {
      backgroundColor: "transaprent !important",
    },
    "& .MuiInputBase-root": {
      paddingBottom: "5px",
    },
    "& .MuiSelect-root": {
      paddingBottom: "0px",
      fontSize: "16px",
    },
    "& > .MuiButtonBase-root": {
      width: "90%",
      marginTop: "20px !important",
    },
  },
  margin: {
    margin: 0,
  },
  withoutLabel: {
    marginTop: theme.spacing(3),
  },
  textField: {
    width: "100%",
  },
}));

const CreateResource = (props) => {
  let TextArea = useRef(null);
  const classes = useStyles();
  const [values, setValues] = useState({
    name: "",
    description: "",
    dueDate: ""
  });

  const [loading, setLoading] = useState(false);
  const [fileInput, setFileInput] = useState(null);
  const [pdfFileError, setPdfFileError] = useState("");
  const [error, setError] = useState(false);

  const userData = useSelector(selectUserData);

  const submitFile = (e) => {
    e.preventDefault();

    if (!fileInput) return;

    setLoading(true);
    const fileName = new Date().getTime() + "-" + fileInput.fileInput.name;
    const uploadTask = storage
      .ref(`assignments/${fileName}`)
      .put(fileInput.fileInput);
    uploadTask.on("state_changed", console.log, console.error, () => {
      storage
        .ref("assignments")
        .child(fileName)
        .getDownloadURL()
        .then((firebaseURL) => {
          return axios.post(
            "http://localhost:5000/resources/createResource",
            {
              name: values.name,
              desc: values.description,
              fieldName: values.fieldName,
              fileLink: firebaseURL,
              creatorEmail: userData.userEmail,
            },
            {
              headers: {
                Authorization: "Bearer " + userData.token,
              },
            }
          );
        })
        .then((res) => {
          props.setShow(false);
          setLoading(false);
          console.log(props);
          props.setIsAssignmentCreated(true);
        })
        .catch((err) => {
          console.log(err);
          props.setShow(false);
          setLoading(false);
        });
    });
  };

  const handleChange = (prop) => (event) => {
    if (prop === "fileInput") {
      if (!event.target.files[0]) {
        return;
      }
      setFileInput({ [prop]: event.target.files[0] });
      const fileType = ["application/pdf"];
      let selectedFile = event.target.files[0];
      if (selectedFile) {
        if (selectedFile && fileType.includes(selectedFile.type)) {
          let reader = new FileReader();
          reader.readAsDataURL(selectedFile);
          reader.onloadend = (e) => {
            setPdfFileError("");
          };
        } else {
          setError(true);
          setPdfFileError("Please select valid pdf file");
        }
      }
    }
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleSubmit = () => {
    setValues({
      name: "",
      description: "",
      dueDate: "",
    });
    setFileInput(null);
  };
  useEffect(() => {
    autosize(TextArea);
  }, []);

  return (
    <>
      <Modal
        className="assignment_modal"
        isOpen={props.isModalOpen}
        toggle={props.toggleModal}
      >
        <ModalBody>
          <div style={{ backgroundColor: "white" }}>
            <div className="container">
              <div className="row justify-content-sm-center">
                <div className="col-12 pb-0">
                  <h1
                    style={{ color: "rgb(90,90,90)" }}
                    className="text-center pt-3 mb-4 fs-2"
                  >
                    Upload Material
                  </h1>
                  <form onSubmit={submitFile}>
                    <FormControl
                      className={clsx(classes.margin, classes.textField)}
                    >
                      <InputLabel htmlFor="name"></InputLabel>
                      <Input
                        placeholder="Resource name"
                        fullWidth
                        id="name"
                        type="text"
                        margin="normal"
                        required
                        value={values.name}
                        onChange={handleChange("name")}
                        startAdornment={
                          <InputAdornment position="start">
                            <PermIdentityIcon />
                          </InputAdornment>
                        }
                      />
                    </FormControl>

                    <FormControl
                      className={clsx(classes.margin, classes.textField)}
                    >
                      <InputLabel htmlFor="description"></InputLabel>
                      <Input
                        style={{
                          outline: "none",
                          border: "none",
                          marginTop: "30px",
                        }}
                        placeholder="Enter Description of type of file (Max 20 characters)"
                        // type
                        id="description"
                        ref={(c) => (TextArea = c)}
                        rows={1}
                        // margin="normal"
                        value={values.description}
                        onChange={handleChange("description")}
                        required
                        startAdornment={
                          <InputAdornment position="start">
                            <AssignmentIcon />
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                    <FormControl className={clsx(classes.margin, classes.textField)}>
                                <InputLabel htmlFor="field"></InputLabel>
                                <Input
                                    style={{marginBottom:"10px"}}
                                    placeholder="Enter Field Name"
                                    fullWidth
                                    id="field"
                                    type="text"
                                    margin="normal"
                                    required
                                    value={values.fieldName}
                                    onChange={handleChange("fieldName")}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <ClassIcon />
                                            {/* <SubjectIcon /> */}
                                        </InputAdornment>
                                    }
                                />
                            </FormControl>
                    

                    <FormControl
                      className={clsx(classes.margin, classes.textField)}
                    >
                      <InputLabel htmlFor="file"></InputLabel>
                      <Input
                        style={{ marginTop: "30px" }}
                        placeholder="Upload pdf file"
                        accept=".pdf"
                        fullWidth
                        id="pdf"
                        type="file"
                        marginTop="30px"
                        required
                        onChange={handleChange("fileInput")}
                        startAdornment={
                          <InputAdornment position="start">
                            <PictureAsPdfIcon />
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                    {pdfFileError && (
                      <div className="error-msg text-danger">
                        {pdfFileError}
                      </div>
                    )}
                    {
                      loading ? (
                        <div className="d-flex justify-content-center mt-4">
                          <CircularProgress />
                        </div>
                      ) : null
                    }
                    {!error ? (
                      <button
                        type="submit"
                        style={{ display: "flex", justifyContent: "center" }}
                        className="m-auto mt-4 form-btn"
                      >
                        Create
                      </button>
                    ) : (
                      <button
                        type="submit"
                        style={{ display: "flex", justifyContent: "center" }}
                        className="m-auto mt-5 form-btn"
                        disabled
                      >
                        Create
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default CreateResource;