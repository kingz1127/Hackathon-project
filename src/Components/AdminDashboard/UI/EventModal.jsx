import React from "react";
import { X, MapPin, Users, Calendar as CalendarIcon } from "lucide-react";

export default function EventModal({ event, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-2">{event.title}</h2>

        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <CalendarIcon className="w-4 h-4" />
          <span>{event.date}</span>
        </div>

        <p className="mb-3 text-sm sm:text-base">{event.description}</p>

        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-red-600" />
          <span className="font-medium">{event.location}</span>
        </div>

        <p className="text-sm text-gray-700 mb-2">
          Organized by <span className="font-semibold">{event.organizer}</span>
        </p>

        {event.participants?.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-sm sm:text-base">Participants</h3>
            </div>
            <p className="text-xs sm:text-sm">{event.participants.join(", ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
