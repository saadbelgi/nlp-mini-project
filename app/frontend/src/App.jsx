import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  console.log(text);

  const getOCR = async (e) => {
    try {
      e.preventDefault();

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://localhost:5000/read_pdf", formData);

      if (res.status == 200) {
        setText(res.data.text);
      }
    } catch (error) {
      console.log(error);
    }
  };

  async function getAnswer(e) {
    try {
      e.preventDefault();

      // const formData = new FormData();
      // formData.append("question", question);
      // formData.append("context", text);

      const res = await axios.post("http://localhost:5000/ans", {
        question: question,
        context: text,
      });

      if (res.status == 200) {
        setAnswer(res.data.text);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <form onSubmit={getOCR}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">test</button>
      </form>

      <div className="flex-col">
        <label htmlFor="" className="">
          Enter context:
        </label>
        <textarea
          className="context"
          onChange={(e) => setText(e.target.value)}
          value={text}
        />
        <label>
          Question:
          <input
            value={question}
            name="question"
            onChange={(e) => setQuestion(e.target.value)}
          />
        </label>
        <button type="submit" onClick={getAnswer}>
          Get Answer
        </button>
      </div>
    </>
  );
}

export default App;
