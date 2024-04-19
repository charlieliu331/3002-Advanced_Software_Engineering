// FileUploadAndSummary.tsx
import React, { useState } from 'react';
import OpenAI from 'openai';

// import * as pdfjsLib from "pdfjs-dist/webpack.mjs"
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.0.279/pdf.worker.min.js'
// pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js';
// pdfjsLib.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.mjs';


interface FileUploadAndSummaryProps {
  transcript: string;
}

const FileUploadAndSummary: React.FC<FileUploadAndSummaryProps> = ({ transcript }) => {
  const [complexity, setComplexity] = useState('');
  const [length, setLength] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<string>('');

  const [summary, setSummary] = useState(''); //for chatgpt summary

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_TOKEN,
    dangerouslyAllowBrowser: true     // Remove 'dangerouslyAllowBrowser: true' if not necessary but haven't tried yet
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files); // Convert FileList to Array
      setFiles(filesArray);
    //   setFiles([...e.target.files]); // Assuming you want to handle multiple files
      const names = Array.from(e.target.files).map(file => file.name).join(', ');
      setFileNames(names);
    }
  };

  const handleComplexityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComplexity(e.target.value);
  };

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLength(e.target.value);
  };

  const handleClearFiles = () => {
    setFiles([]);
    setFileNames('');
  };
  
  // const readFilesContent = async (files: File[]): Promise<string[]> => {
  //   return Promise.all(files.map(file => {
  //     return new Promise<string>((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onload = () => resolve(reader.result as string);
  //       reader.onerror = (error) => reject(error);
  //       reader.readAsText(file);
  //     });
  //   }));
  // };

  const extractTextFromFiles = async (files:File[]) => {
    return Promise.all(files.map(file => {
      if (file.type === 'application/pdf') {
        return extractTextFromPdf(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return extractTextFromDocx(file);
      } else {
        return Promise.resolve('');
      }
    }));
  };

  // const extractTextFromPdf = async (file:File) => {
  //   // var pdfjsLib = require("pdfjs-dist");
  //   const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
  //   let text = '';
  //   for (let i = 1; i <= pdf.numPages; i++) {
  //     const page = await pdf.getPage(i);
  //     const tokenizedText = await page.getTextContent();
  //     text += tokenizedText.items.map((item) => {
  //       // Check if 'item' is a TextItem by checking for the 'str' property
  //       if ('str' in item) {
  //         return item.str;
  //       }
  //       return ''; // Return an empty string for items without 'str', or handle differently
  //     }).join(' ');
  //   }
  //   return text;
  // };
  const extractTextFromPdf = async (file: File) => {
    try {
      const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
      console.log("PDF loaded successfully");
      
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const tokenizedText = await page.getTextContent();
        const pageText = tokenizedText.items.map((item) => {
          // Use a type guard to check if item is a TextItem
          if ('str' in item) {
            return item.str;
          }
          return ''; // Return an empty string for items without 'str', or handle differently
        }).join(' ');
        
        text += pageText + ' '; // Append text of each page with a space in between
      }
      
      console.log("Extracted Text:", text); // Log the extracted text for debugging
      return text;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      return ''; // Return empty string or handle the error as needed
    }
  };

  const extractTextFromDocx = (file:File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const target = event.target;
        const arrayBuffer = target?.result;
        if (arrayBuffer instanceof ArrayBuffer) {
          mammoth.extractRawText({ arrayBuffer: arrayBuffer })
            .then(result => resolve(result.value))
            .catch(err => reject(err));
        } else {
          reject(new Error('Failed to load file'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };



  const generateSummary = async () => {
    try {
      // Read content from files
      // const filesContent = await readFilesContent(files);
      // const combinedContent = filesContent.join('\n\n');

      const filesContent = await extractTextFromFiles(files);
      const combinedContent = filesContent.join('\n\n').trim();

      let prompt = `Summarize the following transcript in a ${complexity} level with length ${length}% of the original input transcripts:\n${transcript}\n`;
      // Construct the prompt
      if (combinedContent) {
      prompt += `Below are the additional contents extracted from additional pdf/docx files ${combinedContent}\n`;
      }

      // Call OpenAI API
      // const response = await openai.chat.completions.create({
      //   model: "gpt-3.5-turbo",
      //   messages: [
      //     {"role": "system", "content": prompt}
      //   ]
      // });
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {"role": "system", "content": prompt}
        ]
      });

      if (response && response.choices && response.choices.length > 0) {
        const summaryText = response.choices[0].message.content;
        if (summaryText != null) {
          setSummary(summaryText);
        }
      }
    } catch (error) {
      console.error('Error generating summary with OpenAI:', error);
    }
  };

  const downloadSummary = () => {
    if (!summary || summary.trim() === '') {
      const confirmDownload = window.confirm("The summary is empty. Do you still want to download?");
      if (!confirmDownload) {
        return; 
      }
    }
    const blob = new Blob([summary], { type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "Summary.txt"; 
    document.body.appendChild(link); // Append to the document
    link.click(); 
    document.body.removeChild(link); // Clean up
    URL.revokeObjectURL(url); // Release object URL
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(3, 1fr)', alignItems: 'center', gap: '10px', padding: '10px' }}>
        <div style={{ fontWeight: 'bold' }}>Complexity</div>
        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <input type="radio" name="complexity" value="beginner" onChange={handleComplexityChange} style={{ marginRight: '5px' }} /> Beginner
        </label>
        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <input type="radio" name="complexity" value="intermediate" onChange={handleComplexityChange} style={{ marginRight: '5px' }} /> Intermediate
        </label>
        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <input type="radio" name="complexity" value="experienced" onChange={handleComplexityChange} style={{ marginRight: '5px' }} /> Experienced
        </label>

        <div style={{ fontWeight: 'bold' }}>Length</div>
        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <input type="radio" name="length" value="25" onChange={handleLengthChange} style={{ marginRight: '5px' }} /> 25%
        </label>
        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <input type="radio" name="length" value="50" onChange={handleLengthChange} style={{ marginRight: '5px' }} /> 50%
        </label>
        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <input type="radio" name="length" value="75" onChange={handleLengthChange} style={{ marginRight: '5px' }} /> 75%
        </label>
      </div>

           




      {/* <div>
        Upload lecture slides/ tutorial questions
        <input type="file" onChange={handleFileChange} multiple />
        {fileNames && <span>Selected files: {fileNames}</span>}
      </div>
      <button 
      className="bg-purple-600 rounded-xl text-white font-medium px-4 py-2 hover:bg-purple-800 w-full sm:w-auto"
      onClick={generateSummary}>Generate Summary</button> */}
      <div className="flex justify-center items-center space-x-4 sm:mt-5 mt-8">
      {/* (Optional) */}
      <label className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-xl cursor-pointer flex-grow sm:flex-grow-0 sm:w-auto">
          Upload pdf/docx (Optional)
            <input
            type="file"
            onChange={handleFileChange}
            multiple
            style={{ display: 'none' }} // Hide the actual file input
            />
        </label>
        <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl flex-grow sm:flex-grow-0 sm:w-auto"
        // className="mt-4 bg-red-700 rounded-xl text-white font-medium px-4 py-2 hover:bg-red-800 w-full sm:w-auto"
        onClick={handleClearFiles}
      > Clear files </button>
        {/* {fileNames && <div className="mt-2">Upload files: {fileNames}</div>} */}
      </div>
      {/* <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}> */}
      {fileNames && (
          <div className="mt-2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '100%', wordBreak: 'break-word' }}>
            Uploaded file: {fileNames}
          </div>
        )}
       

      {/* <div className="mt-4" style={{ display: 'flex', alignItems: 'center' }}>
      
      </div> */}
     <div className="flex justify-center items-center space-x-4 sm:mt-5 mt-8"></div>
      <button
        className="mt-4 flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl w-full sm:w-auto mr-4" // Added mr-4 for right margin
        onClick={generateSummary}
        >
        Generate Summary
      </button>
      <button
        className="mt-4 flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl w-full sm:w-auto"
        onClick={downloadSummary}
        >
        Download Summary
      </button>

      {/* {summary && <div className="summary">{summary}</div>} */}
      <div className="flex flex-col items-start space-y-4 sm:mt-5 mt-8 mb-10">
        <textarea
          id="message"
          rows={5}
          className="block p-2.5 w-full text-lg text-gray-900 bg-white rounded-lg border border-black focus:ring-blue-500 focus:border-none"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Your summarized transcription will be displayed here..."
        />
      </div>
    </div>
  );
};

export default FileUploadAndSummary;
