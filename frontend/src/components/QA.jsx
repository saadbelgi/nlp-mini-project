import { useEffect, useState } from "react";
import axios from "axios";
import uploadIcon from "../assets/u-turn.png";

const QA = () => {
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [answer, setAnswer] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const imgTypes = ["jpg", "jpeg", "png"];

  useEffect(() => {
    const getFileContents = async () => {
      const fileExtension = file.name.split(".")[1];
      try {
        if (fileExtension === "pdf") {
          const formData = new FormData();
          formData.append("file", file);

          const res = await axios.post(
            "http://localhost:5000/read_pdf",
            formData
          );

          if (res.status == 200) {
            setContext(res.data.text);
          }
        } else if (imgTypes.includes(fileExtension)) {
          const formData = new FormData();
          formData.append("file", file);

          const res = await axios.post("http://localhost:5000/ocr", formData);

          if (res.status == 200) {
            setContext(res.data.text);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    getFileContents();
  }, [file]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading === true) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/ans", {
        question,
        context,
      });
      setAnswer(response.data.answer);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Question Answering</h1>
      </header>
      <main className="app-main">
        <div className="left-column">
          <div className="form-group context">
            <label htmlFor="context">Enter a paragraph</label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="file">
            <label htmlFor="file">
              <img
                src={uploadIcon}
                alt="Upload icon"
                style={{ height: "36px", width: "36px" }}
              />{" "}
              Or Upload a file
            </label>
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <div>{file ? file.name : "No file chosen"}</div>
          </div>
        </div>
        <div className="right-column">
          <div className="form-group">
            <label htmlFor="question">Ask away</label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="form-input"
            />
            <button
              type="submit"
              onClick={handleSubmit}
              className="form-button"
              style={{ margin: "auto" }}
            >
              {isLoading ? <div className="loader"></div> : "Get Answer"}
            </button>
          </div>
          <div className="answer-container">
            <h2>Answer</h2>
            <p className="answer-text">
              {answer || "Enter a question and context to get an answer."}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QA;
