import React, { useState } from "react";

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    
    const response = await fetch("http://127.0.0.1:8080/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input }),
    });

    const data = await response.json();

    const botMessage = { sender: "bot", text: data.reply };
    setMessages((prev) => [...prev, botMessage]);

    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat window */}
      {open && (
        <div className="w-80 h-96 bg-white shadow-xl rounded-xl flex flex-col mb-3 border">

          {/* 🔥 ADDED: HEADER */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-t-xl">
            <h2 className="text-sm font-semibold">
              🏥 AI Health Assistant
            </h2>
            <p className="text-xs opacity-90">
              Ask anything about hospitals, diseases, symptoms or treatments
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">

            {/* 🔥 ADDED: EMPTY STATE */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm text-center px-4">
                <span className="text-3xl mb-2">💬</span>
                <p className="font-medium text-gray-500">
                  Ask anything about hospitals & diseases
                </p>
                <p className="text-xs mt-1">
                  Get help with symptoms, treatments, and medical guidance
                </p>
              </div>
            )}

            {/* Existing messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm p-2 rounded-lg max-w-[75%] ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-gray-200 text-black"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex border-t">
            <input
              className="flex-1 p-2 outline-none text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="px-4 text-sm bg-blue-500 text-white hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-blue-600 text-white text-xl shadow-lg hover:bg-blue-700"
      >
        💬
      </button>
    </div>
  );
};

export default ChatbotWidget;