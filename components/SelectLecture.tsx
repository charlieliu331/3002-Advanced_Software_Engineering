import React, { useEffect, useState, ReactNode } from 'react';
import Image from 'next/image';

interface SelectLectureProps {
  setCourse: React.Dispatch<React.SetStateAction<string>>;
  setWeek: React.Dispatch<React.SetStateAction<string>>;
  setLecture: React.Dispatch<React.SetStateAction<string>>;
  setAcademicYear: React.Dispatch<React.SetStateAction<string>>;
  setSemester: React.Dispatch<React.SetStateAction<string>>;
  setTranscript: React.Dispatch<React.SetStateAction<string>>;
}

const SelectLecture: React.FC<SelectLectureProps> = ({ 
  setCourse,
  setWeek,
  setLecture,
  setAcademicYear,
  setSemester,
  setTranscript
}) => {
  const [courseList, setCourseList] = useState<any[]>([])
  const [c, setC] = useState("<empty>")
  const [a, setA] = useState("<empty>")
  const [s, setS] = useState("<empty>")
  const [w, setW] = useState("<empty>")
  const [l, setL] = useState("<empty>")
  const [searchResult, setSearchResult] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [votedItems, setVotedItems] = useState<string[]>([]);

  const handleSubmit = async () => {
    console.log('Course:', c);
    console.log("Academic year:", a);
    console.log("Semester:", s);
    console.log('Week:', w);
    console.log('Lecture number:', l);
    try {
      // Fetch data from API
      const requestUrl = `http://localhost:3000/api/search?title=${c}&academic_year=${a}&semester_num=${s}&week_num=${w}&lec_num=${l}`;
      const response = await fetch(requestUrl);
  
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
  
      const data = await response.json();
  
      let searchData = [];
      if (data.entry) {
        if (Array.isArray(data.entry)) {
          searchData = data.entry;
        } else {
          searchData = [data.entry];
        }
      }
  
      setSearchResult(searchData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const searchCourse = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        setCourseList(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    searchCourse();
  }, []);

  const courseCodes: ReactNode[] = courseList.map(course => (
    <option key={course.code} value={course.code}>
      {course.code}
    </option>
  ));

  const weeks = [];
  for (let i = 1; i <= 13; i++) {
    weeks.push(
      <option key={`week${i}`} value={`${i}`}>
        Week {i}
      </option>
    );
  }

  const academicYear = [];
  for (let year = 23; year>=19; year--) {
    academicYear.push(
      <option key={`AY${year}/${year+1}`} value={`AY${year}/${year+1}`}>
        AY{year}/{year+1}
      </option>
    );
  }

  const handleRowClick = (rowData:any) => {
    console.log('Row clicked:', rowData);
    setSelectedRow(rowData);
    setTranscript(rowData.transcript);
  };

  const handleUpvote = (rowData:any) => {
    if (!votedItems.includes(rowData.id)) {
      console.log('Upvote for rowData:', rowData);
      const updatedSearchResult = searchResult.map((item:any) => {
        if (item.id === rowData.id) {
          return { ...item, positive_num: item.positive_num + 1 };
        }
        return item;
      });
      setSearchResult(updatedSearchResult);
      setVotedItems([...votedItems, rowData.id]);
      updateVote('incrementPositive', rowData);
    }
  };

  const handleDownvote = (rowData:any) => {
    if (!votedItems.includes(rowData.id)) {
      console.log('Downvote for rowData:', rowData);
      const updatedSearchResult = searchResult.map((item:any) => {
        if (item.id === rowData.id) {
          return { ...item, negative_num: item.negative_num + 1 };
        }
        return item;
      });
      setSearchResult(updatedSearchResult);
      setVotedItems([...votedItems, rowData.id]);
      updateVote('incrementNegative', rowData);
    }
  };

  const updateVote = async (type:string, rowData:any) => {
    try {
      // Fetch data from API
      const requestUrl = `http://localhost:3000/api/updatevote?id=${rowData.id}&updateType=${type}`;
      const response = await fetch(requestUrl, {method: 'PUT'});
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="mt-5 flex flex-col space-y-4">

      <div className="flex flex-row space-x-4">
        <select value={c} className="flex-grow" onChange={(e) => {
              setC(e.target.value);
              setCourse(e.target.value);}}>
          <option key="noCourse" value="<empty>">Select course</option>
          {courseCodes}
        </select>

        <select value={a} className="flex-grow" onChange={(e) => {
              setA(e.target.value);
              setAcademicYear(e.target.value);}}>
          <option key="noAcademicYear" value="<empty>">Select AY</option>
          {academicYear}
        </select>

        <select value={s} className="flex-grow" onChange={(e) => {
              setS(e.target.value);
              setSemester(e.target.value);}}>
          <option key="noSemester" value="<empty>">Select semester</option>
          <option key="Semester1" value="1">Semester 1</option>
          <option key="Semester2" value="2">Semester 2</option>
        </select>
      </div>
      
      <div className="flex flex-row space-x-4">

        <select value={w} className="flex-grow" onChange={(e) => {
              setW(e.target.value)
              setWeek(e.target.value);}}>
          <option key="noWeek" value="<empty>">Select week</option>
          {weeks}
        </select>

        <select value={l} className="flex-grow" onChange={(e) => {
              setL(e.target.value);
              setLecture(e.target.value);}}>
          <option key="noLecture" value="<empty>">Select lecture</option>
          <option key="lecture1" value="1">Lecture 1</option>
          <option key="lecture2" value="2">Lecture 2</option>
        </select>

        <button onClick={handleSubmit} className="flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Search</button>
      </div>

      <div className="flex flex-col items-center justify-center mt-4">
        <p className="font-bold">Existing transcripts in the database</p>
        <p className="text-sm">ps. click to check the transcript</p>

        <div className="w-full max-w-screen-md p-4 overflow-auto max-h-60">
          <table className="w-full table-auto border border-black text-xs">
            <thead>
              <tr>
                <th className="border border-black px-2 py-1">Course code</th>
                <th className="border border-black px-2 py-1">AY</th>
                <th className="border border-black px-2 py-1">Sem</th>
                <th className="border border-black px-2 py-1">Week</th>
                <th className="border border-black px-2 py-1">Lec</th>
                <th className="border border-black px-2 py-1">Votes</th>
                <th className="border border-black px-2 py-1">Like it?</th>
              </tr>
            </thead>
            <tbody>
              {searchResult &&
                searchResult.map((item:any, index:any) => (
                  <tr key={index} onClick={() => handleRowClick(item)} className={selectedRow === item ? 'bg-gray-200' : ''}>
                    <td className="border border-black px-2 py-1">{item.title}</td>
                    <td className="border border-black px-2 py-1">{item.academic_year}</td>
                    <td className="border border-black px-2 py-1">{item.semester_num}</td>
                    <td className="border border-black px-2 py-1">{item.week_num}</td>
                    <td className="border border-black px-2 py-1">{item.lec_num}</td>
                    <td className="border border-black px-2 py-1">{item.positive_num-item.negative_num}</td>
                    <td className="border border-black px-1 py-1 flex items-center">
                      <Image 
                        src="/upvote.png" 
                        alt="upvote a record" 
                        width={30} height={30}
                        className="mr-2"
                        onClick={() => handleUpvote(item)}
                      />
                      <Image 
                        src="/downvote.png" 
                        alt="downvote a record" 
                        width={27} height={27}
                        onClick={() => handleDownvote(item)}
                      />
                    </td>
                  </tr>
                ))}
              {!searchResult && (
                <tr>
                  <td colSpan={7} className="border border-black px-4 py-2 text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
};

export default SelectLecture;