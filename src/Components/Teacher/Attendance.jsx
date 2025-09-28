import { useEffect, useState } from "react";
import "./Teacher.css";

export default function Attendance() {
  const teacherId = localStorage.getItem("teacherId");
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [allAttendanceRecords, setAllAttendanceRecords] = useState([]); // Raw attendance records
  const [attendanceMap, setAttendanceMap] = useState({}); // Processed map by date
  const [termLevel, setTermLevel] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const studentsPerPage = 5;

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Fetch teacher-specific students
  useEffect(() => {
    if (!teacherId) return;
    const query = termLevel ? `?termLevel=${termLevel}` : "";
    fetch(`http://localhost:5000/by-teacher/${teacherId}${query}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched students:", data);
        setStudents(data);
      })
      .catch((err) => console.error("Error fetching students:", err));
  }, [teacherId, termLevel]);

  // Fetch ALL attendance records for ALL students at once
  const fetchAllAttendanceRecords = async () => {
    if (students.length === 0) return;
    
    setIsLoading(true);
    console.log("🔄 Fetching all attendance records...");
    
    try {
      // Get all attendance records for all students
      const response = await fetch(`http://localhost:5000/attendance`);
      const allRecords = await response.json();
      
      console.log("📊 All attendance records:", allRecords);
      
      // Filter records for current students only
      const studentIds = students.map(s => s.studentId);
      const relevantRecords = allRecords.filter(record => 
        studentIds.includes(record.studentId)
      );
      
      console.log("📋 Relevant records for current students:", relevantRecords);
      setAllAttendanceRecords(relevantRecords);
      
      // Process into date-based map
      processAttendanceMap(relevantRecords);
      
    } catch (err) {
      console.error("❌ Error fetching attendance:", err);
      
      // Fallback: try individual student requests
      console.log("🔄 Trying individual student requests...");
      await fetchIndividualStudentRecords();
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback method: fetch each student individually
  const fetchIndividualStudentRecords = async () => {
    try {
      const allStudentData = await Promise.all(
        students.map(async (student) => {
          try {
            const response = await fetch(`http://localhost:5000/attendance/student/${student.studentId}`);
            const records = await response.json();
            console.log(`📝 Records for ${student.studentId}:`, records);
            return Array.isArray(records) ? records : [];
          } catch (error) {
            console.error(`❌ Error fetching for ${student.studentId}:`, error);
            return [];
          }
        })
      );
      
      const flatRecords = allStudentData.flat();
      console.log("📊 All individual records combined:", flatRecords);
      setAllAttendanceRecords(flatRecords);
      processAttendanceMap(flatRecords);
      
    } catch (err) {
      console.error("❌ Error in individual fetch:", err);
    }
  };

  // Process raw records into date-based map
  const processAttendanceMap = (records) => {
    console.log("🔨 Processing attendance map from records:", records);
    
    const dateMap = {}; // { "2025-01-15": { studentId1: {status, note}, studentId2: {status, note} } }
    
    records.forEach(record => {
      // Normalize the date format
      let dateKey;
      if (record.date) {
        // Handle different date formats
        const date = new Date(record.date);
        dateKey = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
      } else {
        console.warn("⚠️ Record without date:", record);
        return;
      }
      
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {};
      }
      
      dateMap[dateKey][record.studentId] = {
        status: record.status ? record.status.toLowerCase() : "",
        note: record.note || "",
        date: dateKey,
      };
    });
    
    console.log("✅ Processed attendance map:", dateMap);
    setAttendanceMap(dateMap);
  };

  // Load attendance data when students change
  useEffect(() => {
    if (students.length > 0) {
      fetchAllAttendanceRecords();
    }
  }, [students]);

  // Update attendanceData when selectedDate or attendanceMap changes
  useEffect(() => {
    if (students.length > 0) {
      const selectedDateData = attendanceMap[selectedDate] || {};
      const currentDateAttendance = {};
      
      students.forEach((student) => {
        currentDateAttendance[student.studentId] = selectedDateData[student.studentId] || {
          status: "",
          note: "",
          date: selectedDate,
        };
      });
      
      console.log(`📅 Loading data for ${selectedDate}:`, currentDateAttendance);
      setAttendanceData(currentDateAttendance);
    }
  }, [selectedDate, attendanceMap, students]);

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(students.length / studentsPerPage);

  // Calendar helper
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  // Check attendance completion status for a date
  const getDateAttendanceStatus = (dateStr) => {
    const dayRecords = attendanceMap[dateStr];
    
    // No records at all
    if (!dayRecords || Object.keys(dayRecords).length === 0) {
      return "none";
    }
    
    // Count students with valid attendance status
    const studentsWithAttendance = Object.values(dayRecords)
      .filter(record => record.status && record.status.trim() !== "").length;
    
    const totalStudents = students.length;
    
    console.log(`📊 Date ${dateStr}: ${studentsWithAttendance}/${totalStudents} students marked`);
    
    // All students have attendance marked
    if (studentsWithAttendance === totalStudents && totalStudents > 0) {
      return "complete"; // Green
    }
    
    // Some students have attendance marked but not all
    if (studentsWithAttendance > 0) {
      return "partial"; // Brown-red
    }
    
    // No valid attendance records
    return "none"; // No color
  };

  // Save attendance
  const saveAttendance = async () => {
    const classId = "CS001-IT";
    console.log("💾 Saving attendance for date:", selectedDate);
    console.log("💾 Data to save:", attendanceData);

    try {
      const savePromises = Object.entries(attendanceData)
        .filter(([studentId, data]) => data.status && data.status.trim() !== "")
        .map(async ([studentId, entry]) => {
          const response = await fetch(`http://localhost:5000/attendance/student/${studentId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId,
              classId,
              teacherId,
              date: selectedDate,
              status: entry.status,
              note: entry.note || "",
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to save for ${studentId}: ${response.statusText}`);
          }
          
          return response.json();
        });

      const results = await Promise.all(savePromises);
      console.log("✅ Save results:", results);

      // Update local state immediately
      setAttendanceMap(prevMap => ({
        ...prevMap,
        [selectedDate]: {
          ...prevMap[selectedDate],
          ...Object.fromEntries(
            Object.entries(attendanceData)
              .filter(([_, data]) => data.status && data.status.trim() !== "")
              .map(([studentId, data]) => [studentId, {
                status: data.status,
                note: data.note || "",
                date: selectedDate
              }])
          ),
        },
      }));

      alert(`✅ Attendance for ${selectedDate} saved successfully!`);
      
      // Optionally refresh data from server to ensure sync
      setTimeout(() => fetchAllAttendanceRecords(), 1000);
      
    } catch (err) {
      console.error("❌ Error saving attendance:", err);
      alert(`❌ Error saving attendance: ${err.message}`);
    }
  };

  return (
    <div className="attendance-container">
      {/* LEFT SIDE */}
      <div className="left-section">
        <div className="filters-box">
          <h3>Subject Attendance</h3>
          <div className="filters">
            <select>
              <option>Faculty of CS</option>
            </select>
            <select>
              <option>BSCS</option>
            </select>
            <select>
              <option>FALL 22</option>
            </select>
            <select
              value={termLevel}
              onChange={(e) => setTermLevel(e.target.value)}
            >
              <option value="">All Terms</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
            </select>
            <button>Search</button>
            <button 
              onClick={fetchAllAttendanceRecords} 
              disabled={isLoading}
              style={{ marginLeft: '10px', backgroundColor: isLoading ? '#ccc' : '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px' }}
            >
              {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {/* Selected Date */}
        <div className="selected-date-box">
          <label>Select Date: </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              console.log("📅 Date changed to:", e.target.value);
              setSelectedDate(e.target.value);
            }}
          />
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ margin: '10px', padding: '10px', backgroundColor: '#f0f0f0', fontSize: '12px' }}>
            <strong>Debug Info:</strong><br />
            Students: {students.length} | 
            Records: {allAttendanceRecords.length} | 
            Dates in Map: {Object.keys(attendanceMap).length} |
            Current Date ({selectedDate}): {Object.keys(attendanceData).filter(k => attendanceData[k].status).length}/{students.length} marked |
            Status: {getDateAttendanceStatus(selectedDate)}
          </div>
        )}

        <div className="table-box">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Leave</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student) => {
                const currentRecord = attendanceData[student.studentId] || {};
                const savedStatus = currentRecord.status || "";

                return (
                  <tr key={student.studentId}>
                    <td>{student.studentId}</td>
                    <td>{student.fullName}</td>

                    {["present", "absent", "leave"].map((statusType) => (
                      <td key={statusType}>
                        <input
                          type="radio"
                          name={`status-${student.studentId}`}
                          checked={savedStatus === statusType}
                          onChange={() => {
                            console.log(`📝 Setting ${student.studentId} to ${statusType}`);
                            setAttendanceData((prev) => ({
                              ...prev,
                              [student.studentId]: {
                                ...prev[student.studentId],
                                status: statusType,
                                date: selectedDate,
                              },
                            }));
                          }}
                        />
                      </td>
                    ))}

                    <td>
                      <input
                        className="attendance-note-input"
                        type="text"
                        placeholder="Add note"
                        value={currentRecord.note || ""}
                        onChange={(e) =>
                          setAttendanceData((prev) => ({
                            ...prev,
                            [student.studentId]: {
                              ...prev[student.studentId],
                              note: e.target.value,
                              date: selectedDate,
                            },
                          }))
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button className="save-attendance-btn" onClick={saveAttendance} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Attendance"}
          </button>

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Prev
            </button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="right-section">
        {/* Calendar */}
        <div className="calendar-box">
          <h3>
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
            })}{" "}
            {currentYear}
          </h3>
          <div className="calendar">
            {[...Array(getDaysInMonth(currentMonth, currentYear))].map((_, i) => {
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
              const attendanceStatus = getDateAttendanceStatus(dateStr);
              const isSelected = selectedDate === dateStr;

              // Determine CSS class based on status and selection
              let dayClass = "day";
              let titleText = "";

              if (isSelected) {
                dayClass += " selected"; // Yellow - currently editing
                titleText = "Currently editing this date";
              } else {
                switch (attendanceStatus) {
                  case "complete":
                    dayClass += " complete"; // Green - all students marked
                    titleText = "All students attendance marked";
                    break;
                  case "partial":
                    dayClass += " partial"; // Brown-red - some students marked
                    const dayRecords = attendanceMap[dateStr] || {};
                    const markedCount = Object.values(dayRecords).filter(r => r.status && r.status.trim() !== "").length;
                    titleText = `${markedCount}/${students.length} students marked - Click to complete`;
                    break;
                  case "none":
                  default:
                    // No additional class - no color
                    titleText = "No attendance recorded - Click to mark";
                    break;
                }
              }

              return (
                <div
                  key={i}
                  className={dayClass}
                  title={titleText}
                  onClick={() => {
                    console.log("📅 Calendar day clicked:", dateStr, "Status:", attendanceStatus);
                    setSelectedDate(dateStr);
                  }}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="totals-box">
          <div className="total yellow">{students.length} Total Students</div>
          <div className="total green">
            {Object.values(attendanceData).filter((a) => a.status === "present").length} Present
          </div>
          <div className="total red">
            {Object.values(attendanceData).filter((a) => a.status === "absent").length} Absent
          </div>
          <div className="total orange">
            {Object.values(attendanceData).filter((a) => a.status === "leave").length} Leave
          </div>
        </div>
      </div>
    </div>
  );
}