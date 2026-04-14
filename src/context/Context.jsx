// src/context/Context.jsx
import { createContext, useState } from "react";
import runChat from "../config/Gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  const newChat = () => {
    setLoading(false);
    setShowResults(false);
    setResultData("");
    setInput("");
    setRecentPrompt("");
  };

  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResults(true);

    let finalPrompt;

    if (prompt !== undefined) {
      finalPrompt = prompt;
      setRecentPrompt(prompt);
      setPrevPrompts((prev) => [prompt, ...prev]);
    } else {
      finalPrompt = input;
      setRecentPrompt(input);
      setPrevPrompts((prev) => [input, ...prev]);
    }

    if (!finalPrompt || finalPrompt.trim() === "") {
      setLoading(false);
      return;
    }

    console.log("Sending prompt to backend:", finalPrompt);

    // Call backend and always get back a string
    const response = await runChat(finalPrompt);
    console.log("Reply from backend (raw):", response);

    // Just convert newlines to <br/> and show
    const formatted = String(response || "").replace(/\n/g, "<br/>");

    setResultData(formatted);
    setLoading(false);
    setInput("");
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    input,
    setInput,
    showResults,
    loading,
    resultData,
    newChat,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
