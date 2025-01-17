"use client"
import { useState, useRef } from 'react';

export default function Home() {
  const [delay, setDelay] = useState(0);
  const [playbackDelay, setPlaybackDelay] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);

  const updatePlaybackDelay = (value: number) => {
    setPlaybackDelay(value);
    if (isRecording && delayNodeRef.current && audioContextRef.current) {
      delayNodeRef.current.delayTime.value = (delay + value) / 1000; // Opóźnienie w sekundach
    }
  };

  const startRecording = async () => {
    audioContextRef.current = new (window.AudioContext || window.AudioContext)();
    mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (audioContextRef.current && mediaStreamRef.current) {
      sourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      delayNodeRef.current = audioContextRef.current.createDelay();
      delayNodeRef.current.delayTime.value = (delay + playbackDelay) / 1000; // Opóźnienie w sekundach
      if (sourceRef.current && delayNodeRef.current) {
        sourceRef.current.connect(delayNodeRef.current);
        delayNodeRef.current.connect(audioContextRef.current.destination);
      }
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-red-800 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8 text-white">Symulator Opóźnionego Sprzężenia Zwrotnego (DAF)</h1>
      <div className="mb-4">
        <label htmlFor="delay" className="block text-lg mb-2 text-white">Opóźnienie (ms): {delay + playbackDelay}</label>
        <input
          type="range"
          min="0"
          max="2000"
          value={playbackDelay}
          onChange={(e) => updatePlaybackDelay(parseInt(e.target.value))}
          className="w-64"
        />
      </div>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded-lg text-white ${isRecording ? 'bg-red-500' : 'bg-green-500'}`}
      >
        {isRecording ? 'Zatrzymaj' : 'Start'}
      </button>
    </div>
  );
}