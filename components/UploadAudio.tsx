import React, { useState } from 'react';
import OpenAI from 'openai';


interface UploadAudioProps {
  setFinalTranscript: React.Dispatch<React.SetStateAction<string>>;
}

const UploadAudio: React.FC<UploadAudioProps> = ({setFinalTranscript}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_TOKEN,
    dangerouslyAllowBrowser: true
  });

  const handleFileChange = (e:any) => {
    const file = e.target.files[0];
    if (file && (file.type.includes('audio/') || file.type.includes('video/'))) {
      setSelectedFile(file);
      setError('');
    } else {
      setSelectedFile(null);
      setError('Please select a valid audio or video file.');
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      transcribeAudio(selectedFile);
      // setSelectedFile(null);
    }
  };

  const transcribeAudio = async (audioFile: File) => {
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
      });
      console.log(transcription);
      setFinalTranscript(transcription.text);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  return (
    <div className="mt-5 flex items-center">
      <input type="file" onChange={handleFileChange} accept="audio/*,video/*" className="mr-5 border border-gray-400" />
      {selectedFile && (
        <div>
          {/* <p>Selected File: {selectedFile.name}</p> */}
          <button onClick={handleUpload} className="flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Generate Transcript</button>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default UploadAudio;