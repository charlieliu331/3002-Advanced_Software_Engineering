// TranscriptDownload.tsx
import React from 'react';

interface TranscriptDownloadProps {
  transcript: string;
  setTranscript: React.Dispatch<React.SetStateAction<string>>;
  course: string;
  week: string;
  lecture: string;
  academicYear: string;
  semester: string;
}

const TranscriptDownload: React.FC<TranscriptDownloadProps> = ({ transcript, setTranscript, course, week, lecture, academicYear, semester }) => {
  const downloadTranscript = () => {
    const element = document.createElement("a");
    const file = new Blob([transcript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "transcript.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const uploadTranscript = async () => {
    try {
      const week_num = parseInt(week,10);
      const semester_num = parseInt(semester,10);
      const lec_num =parseInt(lecture,10);
      console.log({
        title: course,
        week_num: week_num,
        lec_num: lec_num,
        transcript: transcript,
        academic_year: academicYear,
        semester_num: semester_num,
      });
      const response = await fetch('http://localhost:3000/api/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: course,
          week_num:week_num,
          lec_num:lec_num,
          transcript: transcript,
          academic_year: academicYear,
          semester_num:semester_num,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Network response was not ok');
      }

      // Handle success
      alert('Transcript uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload transcript', error);
      alert('Failed to upload transcript.\nReason: ' + error.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-start space-y-4 sm:mt-5 mt-8 mb-10">
        <textarea
          id="message"
          rows={5}
          className="block p-2.5 w-full text-lg text-gray-900 bg-white rounded-lg border border-black focus:ring-blue-500 focus:border-none"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Edit your transcribed text here..."
        />
      </div>
      <div className="flex justify-center items-center space-x-4 sm:mt-5 mt-8">
        <button
          className="bg-blue-500 rounded-xl text-white font-bold px-4 py-2 hover:bg-blue-700 w-full sm:w-auto"
          onClick={downloadTranscript}
        >
          Download Transcript
        </button>

        <button
          className="bg-blue-500 rounded-xl text-white font-bold px-4 py-2 hover:bg-blue-700 w-full sm:w-auto"
          onClick={uploadTranscript}
        >
          Upload Transcript
        </button>

      </div>
    </div>
  );
};

export default TranscriptDownload;
