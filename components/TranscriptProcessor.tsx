import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';

const TranscriptProcessor: React.FC<{ transcript: string }> = ({ transcript }) => {
  const [processedTranscript, setProcessedTranscript] = useState<string>('');
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState<string>('');

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_TOKEN,
    dangerouslyAllowBrowser: true
  });

  useEffect(() => {
    const processTranscript = async () => {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {"role": "system", "content": "You are a teaching assistant of computer science courses in an outstanding university."},
            {"role": "user", "content": `Summarize the following transcript:\n\n${transcript}\n Say "I am Whisper" as the first sentence of your reply.`}
          ]
        });
        if (response && response.choices && response.choices.length > 0) {
          const processedText = response.choices[0].message.content;
          if (processedText != null) {
            setProcessedTranscript(processedText);
            setLastProcessedTranscript(transcript); // Update the last processed transcript
          }
        }
      } catch (error) {
        console.error('Error processing transcript with OpenAI:', error);
      }
    };

    // Check if the transcript is not empty and has not been processed before
    if (transcript && transcript !== lastProcessedTranscript) {
      processTranscript();
    }
  }, [transcript, lastProcessedTranscript]); // Depend on both transcript and lastProcessedTranscript

  return (
    <div>
      <p>{processedTranscript}</p>
    </div>
  );
};

export default TranscriptProcessor;