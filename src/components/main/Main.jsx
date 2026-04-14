import { useContext, useRef, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import "./main.css";
import { Context } from "../../context/Context";

const Main = () => {
  const {
    onSent,
    recentPrompt,
    showResults,
    loading,
    resultData,
    setInput,
    input,
  } = useContext(Context);

  const resultContainerRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (resultContainerRef.current) {
      resultContainerRef.current.scrollTop =
        resultContainerRef.current.scrollHeight;
    }
  }, [resultData, loading]);

  const handleMicClick = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "te-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = () => {
      alert("Error occurred during voice recognition. Please try again.");
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleSend = () => {
    if (!loading && input.trim() !== "") {
      onSent();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="main">
      <div className="nav">
        <p>మాతృAI</p>
        <img src={assets.user} alt="" />
      </div>

      <div className="main-container">
        {!showResults ? (
          <div className="greet">
            <p><span>హలో,</span></p>
            <p>ఈ రోజు మీకు ఎలా సహాయం చేయగలను?</p>
          </div>
        ) : (
          <div className="result" ref={resultContainerRef}>
            <div className="result-title">
              <img src={assets.user} alt="" />
              <p>{recentPrompt}</p>
            </div>

            <div className="result-data">
              <img src={assets.gemini_icon} alt="" />

              {loading ? (
                <div className="loader">
                  <hr />
                  <hr />
                  <hr />
                </div>
              ) : (
                <p className="result-text">
                  {resultData || "సమాధానం అందలేదు."}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="main-bottom">
          <div className="search-box">
            <div>
              <img
                src={assets.mic_icon}
                alt="Mic"
                onClick={handleMicClick}
                style={{
                  cursor: "pointer",
                  opacity: isRecording ? 0.5 : 1,
                  marginRight: "10px",
                }}
              />
            </div>

            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              type="text"
              placeholder="ఇక్కడ ప్రాంప్ట్‌ను నమోదు చేయండి..."
              onKeyDown={handleKeyDown}
            />

            <div>
              <img
                src={assets.send_icon}
                alt="Send"
                onClick={handleSend}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>

          <div className="bottom-info">
            <p>
              మాతృAI తప్పు సమాచారం చూపించవచ్చు, ముఖ్యంగా వ్యక్తుల గురించి, కాబట్టి దాని
              సమాధానాలను రెండుసార్లు తనిఖీ చేయండి.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
