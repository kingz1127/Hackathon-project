import React from "react";
import { ListChecks } from "lucide-react";
import EventCard from "./EventCard";

export default function EventList({ events, onSelect }) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="bg-white shadow rounded-lg p-4 max-h-[600px] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <ListChecks className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-semibold">Upcoming Events</h2>
      </div>
      {sortedEvents.map((event) => (
        <EventCard key={event._id} event={event} onClick={() => onSelect(event)} />
      ))}
    </div>
  );
}
