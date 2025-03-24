import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";
import "./App.css";

const SymptomTracker = () => {
  const [newSymptom, setNewSymptom] = useState("");
  const [intensity, setIntensity] = useState(3);
  const [symptoms, setSymptoms] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch symptoms for the selected date
  const fetchSymptoms = async (date) => {
    try {
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      const response = await fetch(`http://localhost:5000/symptoms?date=${formattedDate}`);
      const data = await response.json();
      if (response.ok) {
        setSymptoms((prevSymptoms) => ({
          ...prevSymptoms,
          [formattedDate]: data.symptoms || [],
        }));
      } else {
        console.error("Failed to fetch symptoms:", data.msg);
      }
    } catch (error) {
      console.error("Error fetching symptoms:", error);
    }
  };

  // Fetch symptoms when the selected date changes
  useEffect(() => {
    fetchSymptoms(selectedDate);
  }, [selectedDate]);

  // Handle adding a symptom
  const handleAddSymptom = async () => {
    if (!newSymptom.trim()) return;

    const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
    const timestamp = dayjs().format("HH:mm:ss");

    // Prevent adding symptoms for future dates
    if (dayjs(selectedDate).isAfter(dayjs(), "day")) {
      alert("❌ Cannot add symptoms for future dates.");
      return;
    }

    const newSymptomEntry = {
      symptom: newSymptom,
      time: timestamp,
      intensity,
    };

    try {
      const response = await fetch("http://localhost:5000/symptoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formattedDate,
          symptoms: [newSymptomEntry],
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.msg);

      // Update local state
      setSymptoms((prevSymptoms) => ({
        ...prevSymptoms,
        [formattedDate]: [...(prevSymptoms[formattedDate] || []), newSymptomEntry],
      }));

      setNewSymptom("");
      setIntensity(3);
      alert("✅ Symptom added successfully!");
    } catch (error) {
      console.error("Error adding symptom:", error);
      alert("❌ Failed to add symptom.");
    }
  };

  // Highlight days with symptoms
  const tileClassName = ({ date }) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    if (symptoms[formattedDate]?.length > 0) {
      return "highlighted-day";
    }
    return null;
  };

  // Get intensity-specific class for symptom list items
  const getIntensityClass = (intensity) => {
    if (intensity <= 2) return "intensity-low";
    if (intensity === 3) return "intensity-medium";
    if (intensity >= 4) return "intensity-high";
  };

  return (
    <div className="symptom-tracker-container">
      <h2 className="symptom-tracker-title">Symptom Tracker</h2>

      {/* Calendar for Date Selection */}
      <div className="calendar-container">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={tileClassName} // Highlight days with symptoms
          maxDate={new Date()} // Prevent selecting future dates
        />
      </div>

      {/* Symptom Input */}
      <div className="input-container">
        <input
          type="text"
          className="symptom-input"
          value={newSymptom}
          onChange={(e) => setNewSymptom(e.target.value)}
          placeholder="Enter symptom"
        />

        {/* Intensity Buttons */}
        <div className="intensity-buttons">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              className={`intensity-button intensity-${level} ${
                intensity === level ? "active" : ""
              }`}
              onClick={() => setIntensity(level)}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Add Symptom Button */}
        <button
          className="add-symptom-button"
          onClick={handleAddSymptom}
          disabled={dayjs(selectedDate).isAfter(dayjs(), "day")} // Disable for future dates
        >
          Add Symptom
        </button>
      </div>

      {/* Display Symptoms List */}
      <div className="symptoms-list">
        <h3>Symptoms on {dayjs(selectedDate).format("YYYY-MM-DD")}</h3>
        <ul>
          {symptoms[dayjs(selectedDate).format("YYYY-MM-DD")]?.map((entry, index) => (
            <li
              key={index}
              className={`symptom-item ${getIntensityClass(entry.intensity)}`}
            >
              <strong>{entry.symptom}</strong> at {entry.time} (Intensity: {entry.intensity})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SymptomTracker;