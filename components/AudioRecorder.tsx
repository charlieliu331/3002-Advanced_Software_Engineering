import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';
const MicRecorder = require('mic-recorder-to-mp3');

interface AudioRecorderProps {
  setFinalTranscript: React.Dispatch<React.SetStateAction<string>>;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ setFinalTranscript }) => {
  const [transcript, setTranscript] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<string>('00:00');
  const [player, setPlayer] = useState<HTMLAudioElement | null>(null);
  const [recorder, setRecorder] = useState(new MicRecorder({ bitRate: 128 }));

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_TOKEN,
    dangerouslyAllowBrowser: true
  });

  useEffect(() => {
    let interval: any = null;
    if (isRecording && recordingStartTime) {
      interval = setInterval(() => {
        const duration = Date.now() - recordingStartTime;
        const minutes = Math.floor(duration / 60000);
        const seconds = ((duration % 60000) / 1000).toFixed(0);
        setRecordingDuration(`${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`);
      }, 1000);
    } else {
      setRecordingDuration('00:00');
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording, recordingStartTime]);

  const startRecording = () => {
    recorder.start().then(() => {
      setIsRecording(true);
      setRecordingStartTime(Date.now());
    }).catch((e: Error) => {
      console.error('Error starting recording:', e);
    });
  };

  const stopRecording = () => {
    recorder.stop().getMp3().then(([buffer, blob]: [ArrayBuffer, Blob]) => {
      const file = new File([blob], 'recorded_audio.mp3', {
        type: blob.type,
        lastModified: Date.now()
      });

      const url = URL.createObjectURL(file);
      const audioPlayer = new Audio(url);
      setPlayer(audioPlayer);

      setIsRecording(false);
      setRecordingStartTime(null);
      transcribeAudio(file);
    }).catch((e: Error) => {
      console.error('Error stopping recording:', e);
    });
  };

  const handleDownload = () => {
    if (player) {
      const url = player.src;
      const link = document.createElement('a');
      link.href = url;
      link.download = 'recorded_audio.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const transcribeAudio = async (audioFile: File) => {
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
      });
      console.log(transcription);
      setTranscript(transcription.text);
      setFinalTranscript(transcription.text);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  return (
    <div>
      {!player && !recordingDuration && (
        <div className="flex justify-center items-center mt-4">
          <div className="bg-gray-800 text-white rounded-lg shadow px-5 py-2 flex items-center">
            <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M8 7H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2v-9a2 2 0 00-2-2h-2m-6 0V3m0 4h4m-2 4v9m-4-6h8"></path>
            </svg>
            <span className="font-semibold text-lg">Stopwatch</span>
          </div>
        </div>
      )}

      {isRecording && (
        <div className="flex justify-center items-center mt-4">
          <div className="bg-slate-800 text-white rounded-lg shadow px-5 py-2 flex items-center">
            <span className="font-semibold text-lg">Duration: {recordingDuration}</span>
          </div>
        </div>
      )}

      {player && !isRecording && (
        <div className="flex justify-center items-center space-x-4 sm:mt-5 mt-8">
          <audio src={player.src} controls />
        </div>          
      )}
      <div className="flex justify-center items-center space-x-4 sm:mt-5 mt-8">
        <button
          className="bg-green-600 rounded-xl text-white font-medium px-4 py-2 hover:bg-green-600 w-full sm:w-auto"
          onClick={startRecording}
        >
          Record your audio
        </button>
        <button
          className="bg-red-700 rounded-xl text-white font-medium px-4 py-2 hover:bg-black/80 w-full sm:w-auto"
          onClick={stopRecording}
        >
          Stop your audio
        </button>
        <button
          className={`bg-blue-700 rounded-xl text-white font-medium px-4 py-2 hover:bg-black/80 w-full sm:w-auto ${
            !player ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''
          }`}
          onClick={handleDownload}
          disabled={!player} // This disables the button when `player` is null or undefined
        >
          Download your audio
        </button>
      </div>
      <div className="flex flex-col items-start space-y-4 sm:mt-5 mt-8 mb-10">
        <label htmlFor="message" className="block text-sm font-medium text-gray-900 dark:text-black">
          Your transcript
        </label>
        <textarea
          id="message"
          rows={4}
          className="block p-2.5 w-full text-lg text-gray-900 bg-white rounded-lg border-none focus:ring-blue-500 focus:border-none"
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            setFinalTranscript(e.target.value);
          }}
          placeholder="Edit your transcribed text here..."
        />
      </div>
    </div>
  );
};

export default AudioRecorder;
