"use client";

import React, { useState } from "react";
import { MessageSquare, X, Send, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ChatbotProps {
  recommendationData?: any;
}

export const RecommendationChatbot: React.FC<ChatbotProps> = ({
  recommendationData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: "bot" | "user"; text: string }>>([
    {
      sender: "bot",
      text: "Hello! I am the ReLife AI Decision Auditor. Ask me why specific recovery pathways were ranked, how costs were calculated, or what safety constraints were enforced.",
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    const newMsgs = [...messages, { sender: "user" as const, text: userMsg }];
    setMessages(newMsgs);
    setInput("");

    // Synthesize contextual reply based on recommendation data
    setTimeout(() => {
      let botReply = "The decision engine evaluates five simultaneous pathways based on configured business weights.";
      const lower = userMsg.toLowerCase();

      if (lower.includes("why") || lower.includes("resale") || lower.includes("choose")) {
        botReply = recommendationData?.explanation ||
          "Direct Resale was ranked #1 because the Net Recovery Value (NRV) of ₹33,535 exceeds repair cost offsets with 96% circularity score and 0 critical structural safety flags.";
      } else if (lower.includes("co2") || lower.includes("carbon") || lower.includes("environment")) {
        botReply = "The environmental score is derived from ADEME/ITU LCA factors. Choosing direct resale avoids 208.8 kg CO2eq by preventing new manufacturing emissions.";
      } else if (lower.includes("safety") || lower.includes("crack") || lower.includes("risk")) {
        botReply = "Safety constraints strictly exclude direct resale if high-confidence structural screen/casing cracks or high deformation are detected by YOLOv8 vision.";
      } else if (lower.includes("cost") || lower.includes("repair")) {
        botReply = "Repair costs include OEM parts lookup plus standard technician labor hours (₹450/hr).";
      }

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105 border border-slate-700"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <span className="text-xs font-bold">Ask AI Why</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[460px] animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold">ReLife Decision Explainer</h4>
                <p className="text-[10px] text-emerald-400 font-medium">Multi-Criteria Reasoning Model</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] text-xs p-3 rounded-2xl leading-relaxed ${
                    m.sender === "user"
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-white border-t border-slate-100 flex gap-1 overflow-x-auto">
            <button
              onClick={() => setInput("Why was the winning pathway chosen?")}
              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded whitespace-nowrap"
            >
              Why this pathway?
            </button>
            <button
              onClick={() => setInput("What is the CO2 savings difference?")}
              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded whitespace-nowrap"
            >
              CO2 Impact?
            </button>
            <button
              onClick={() => setInput("Are there safety exclusions?")}
              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded whitespace-nowrap"
            >
              Safety rules?
            </button>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Button size="sm" onClick={handleSend} className="px-3">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
