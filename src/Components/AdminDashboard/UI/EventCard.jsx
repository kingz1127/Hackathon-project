import React from "react";

export default function EventCard({ event, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-3 mb-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
    >
      <h3 className="font-semibold text-sm sm:text-base truncate">{event.title}</h3>
      <p className="text-xs text-gray-500">{event.date}</p>
      <p className="text-xs sm:text-sm text-gray-600 truncate">{event.location}</p>
    </div>
  );
}
