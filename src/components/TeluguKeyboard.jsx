import React, { useState } from "react";
import "./TeluguKeyboard.css"; // Import the CSS file

const TeluguKeyboard = ({ onKeyPress }) => {
    const [isShiftActive, setIsShiftActive] = useState(false); // State to toggle between letters and matras
    
    const teluguLayout = {
        default: [
            "క ఖ గ ఘ ఙ చ ఛ జ ఝ ఞ ట ఠ డ ఢ ణ",
            "త థ ద ధ న ప ఫ బ భ మ",
            "{shift} య ర ల వ శ ష స హ ళ {bksp}",
            "అ ఆ ఇ ఈ ఉ ఊ ఋ ఎ ఐ ఓ ఔ అం అః",
            "ా ి ీ ు ూ ృ ె ే ై ొ ో ౌ ్ {space}"
        ],
        shift: [
            "క ఖ గ ఘ ఙ చ ఛ జ ఝ ఞ ట ఠ డ ఢ ణ",
            "త థ ద ధ న ప ఫ బ భ మ",
            "{shift} య ర ల వ శ ష స హ ళ {bksp}",
            "అ ఆ ఇ ఈ ఉ ఊ ఋ ఎ ఐ ఓ ఔ అం అః",
            "ా ి ీ ు ూ ృ ె ే ై ొ ో ౌ ్ {space}"
        ]
    };

    const keysToRender = isShiftActive ? teluguLayout.shift : teluguLayout.default;

    return (
        <div className="telugu-keyboard">
            {keysToRender.map((row, rowIndex) => (
                <div key={rowIndex} className="keyboard-row">
                    {row.split(" ").map((key, keyIndex) => (
                        <button
                            key={keyIndex}
                            className={`key ${key === "{shift}" ? "shift" : ""} ${
                                key === "{bksp}" ? "backspace" : ""
                            } ${key === "{space}" ? "space" : ""}`}
                            onClick={() => {
                                if (key === "{shift}") {
                                    setIsShiftActive((prev) => !prev);
                                } else if (key === "{bksp}") {
                                    onKeyPress("BACKSPACE");
                                } else if (key === "{space}") {
                                    onKeyPress(" ");
                                } else {
                                    onKeyPress(key);
                                }
                            }}
                        >
                            {key === "{shift}"
                                ? "Shift"
                                : key === "{bksp}"
                                ? "బ్యాక్‌స్పేస్"
                                : key === "{space}"
                                ? "స్పేస్"
                                : key}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default TeluguKeyboard;