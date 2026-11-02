"use client";

import React, { useState } from "react";
import { Mic, MicOff, Sparkles, Check, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { endpoints } from "@/lib/api";

interface VoiceInputProps {
  inspectionId?: string;
  onParsedDefects: (defects: any[]) => void;
}

const DEMO_TRANSCRIPTS = [
  "Found severe hairline crack on the screen glass and minor scratch on bottom casing lid",
  "Noticeable dent on rear aluminium edge, keyboard spacebar is sticky and missing keycap",
  "Chassis corner deformation from drop, minor scuff marks along front bezel frame",
  "Water damage corrosion detected around USB ports, display touch responsive",
];

export const VoiceInspectionInput: React.FC<VoiceInputProps> = ({
  inspectionId,
  onParsedDefects,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any | null>(null);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate live speech recognition streaming
      const randomDemo = DEMO_TRANSCRIPTS[Math.floor(Math.random() * DEMO_TRANSCRIPTS.length)];
      setTimeout(() => {
        setTranscript(randomDemo);
        setIsRecording(false);
      }, 1800);
    } else {
      setIsRecording(false);
    }
  };

  const handleParse = async () => {
    if (!transcript.trim()) return;
    setIsParsing(true);
    try {
      const res = await endpoints.parseVoice(transcript, inspectionId);
      const data = res.data.parsed_output;
      setParsedResult(data);
      onParsedDefects(data.defects || []);
    } catch (err: any) {
      alert("Failed to parse voice transcript");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Voice-to-Defect Logger</h4>
            <p className="text-xs text-slate-500">Dictate findings; AI extracts structured defect records</p>
          </div>
        </div>

        {/* Pulse Recording Button */}
        <button
          type="button"
          onClick={toggleRecording}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
            isRecording
              ? "bg-rose-500 text-white animate-pulse"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          {isRecording ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              Listening...
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              Start Dictation
            </>
          )}
        </button>
      </div>

      {/* Transcript Input / Area */}
      <div className="relative mt-2">
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Speak or type inspection observations (e.g. 'Hairline crack on screen, cosmetic dent on edge')..."
          rows={2}
          className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Quick Demo Sentence Suggestions */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold text-slate-400 uppercase">Presets:</span>
        {DEMO_TRANSCRIPTS.slice(0, 2).map((t, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setTranscript(t)}
            className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md truncate max-w-xs transition-colors"
          >
            "{t}"
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Button
          type="button"
          size="sm"
          onClick={handleParse}
          isLoading={isParsing}
          disabled={!transcript.trim()}
          className="font-bold text-xs"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          Parse NLP Defects
        </Button>

        {parsedResult && (
          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            {parsedResult.detected_defect_count} defect(s) structured
          </span>
        )}
      </div>

      {/* Extracted Chips Display */}
      {parsedResult && parsedResult.defects && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Extracted Entities:</div>
          <div className="flex flex-wrap gap-1.5">
            {parsedResult.defects.map((d: any, i: number) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium"
              >
                <Tag className="w-3 h-3 text-emerald-600" />
                <strong className="capitalize">{d.defect_category}</strong> ({d.location}) •{" "}
                <span className="text-emerald-700 uppercase font-bold text-[10px]">{d.severity_estimate}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
