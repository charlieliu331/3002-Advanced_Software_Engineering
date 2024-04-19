import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { SetStateAction, useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Toggle from '../components/Toggle';

// import TranscriptProcessor from '../components/TranscriptProcessor';
import TranscriptDownload from '../components/TranscriptDownload';
import FileUploadAndSummary from '../components/FileUploadAndSummary';
import AudioRecorder from '../components/AudioRecorder';
import TranscriptProcessor from '../components/TranscriptProcessor';
import SelectLecture from '../components/SelectLecture';
import UploadAudio from '../components/UploadAudio';
import AIChatButton from "../components/AIChatButton";

const Home: NextPage = () => {
  const [isGPT4, setIsGPT4] = useState(false);
  const [transcript, setTranscript] = useState(''); // State to hold the transcript
  const [course, setCourse] = useState('<empty>');
  const [week, setWeek] = useState('<empty>');
  const [lecture, setLecture] = useState('<empty>');
  const [academicYear, setAcademicYear] = useState('<empty>');
  const [semester, setSemester] = useState('<empty>');
  
  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Anti Study Study Tool</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <p className="border rounded-2xl py-1 px-4 text-slate-500 text-sm mb-5 hover:scale-105 transition duration-300 ease-in-out">
          <b>113,217</b> summaries generated so far
        </p>
        <h1 className="sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900">
          Anti Study Study Tool
        </h1>
        <div className="mt-7">
          <Toggle isGPT4={isGPT4} setIsGPT4={setIsGPT4} />
        </div>

        {/* part 1 */}
        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            <Image src="/1-black.png" width={30} height={30} alt="1 icon" className="mb-5 sm:mb-0" />
            <p className="text-left font-medium"> Input information of the lecture </p>
          </div>
          <div className="block">
            <SelectLecture setCourse={setCourse} setWeek={setWeek} setLecture={setLecture} setAcademicYear={setAcademicYear} setSemester={setSemester} setTranscript={setTranscript}/>
          </div>
        </div>

        {/* part 2 */}
        <div className="max-w-xl w-full">
          <div className="flex mt-8 items-center space-x-3">
            <Image src="/2-black.png" width={30} height={30} alt="2 icon" className="mb-5 sm:mb-0" />
            <p className="text-left font-medium">Not satisfied? Upload your own video/audio </p>
          </div>
          <div className="block">
            <UploadAudio setFinalTranscript={setTranscript}/>
          </div>
        </div>
        
        <div className="max-w-xl w-full">
          {/* // Part three */}
          <div className="flex mt-8 items-center space-x-3">
            <Image src="/3-black.png" width={30} height={30} alt="3 icon" />
            <p className="text-left font-medium">Transcripts retrived/generated</p>
          </div>
          <div className="block">
            <TranscriptDownload transcript={transcript} course={course} week={week} lecture={lecture} academicYear={academicYear} semester={semester} setTranscript={setTranscript} />
          </div>
        </div>

        <div className="max-w-xl w-full">
          {/* //Part Four */}
          <div className="flex mt-8 items-center space-x-3">
              <Image src="/4-black.png" width={30} height={30} alt="1 icon" />
              <p className="text-left font-medium">Context for summary</p>
          </div>
          <div className="block">
            <FileUploadAndSummary transcript={transcript} />
          </div>
        </div>

        <div className="max-w-xl w-full">
          <div>
            <div className="flex mb-5 items-center space-x-3">
              <Image src="/5-black.png" width={30} height={30} alt="6 icon" />
              <p className="text-left font-medium">
                Further questions? Discuss with Chatbot!
              </p>
            </div>
            <div className="block">
              <AIChatButton transcript={transcript} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
