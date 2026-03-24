import { useState, useEffect, useRef, useCallback } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const micRef = useRef(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      setError('Speech Recognition is not supported in this browser. Please use Chrome.');
      return;
    }
    const mic = new SpeechRecognition();
    mic.continuous = true;
    mic.interimResults = true;
    mic.lang = 'en-US';
    mic.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      setTranscript(text);
    };
    mic.onerror = (event) => {
      setError(`Microphone error: ${event.error}`);
      setIsListening(false);
    };
    mic.onend = () => {
      if (micRef.current && micRef._listening) {
        mic.start();
      }
    };
    micRef.current = mic;
  }, []);

  const startListening = useCallback(() => {
    if (!micRef.current) return;
    setError(null);
    setTranscript('');
    micRef._listening = true;
    micRef.current.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (!micRef.current) return;
    micRef._listening = false;
    micRef.current.stop();
    setIsListening(false);
  }, []);

  return { transcript, isListening, error, startListening, stopListening, setTranscript };
}
