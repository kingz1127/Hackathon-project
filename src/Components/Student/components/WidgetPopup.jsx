// import { useState } from 'react';
// import HelpPage from '../pages/HelpPage';
// import HomePage from '../pages/HomePage';
// import MessagesPage from '../pages/MessagesPage';
// import '../Widget.css';
// import BottomNav from './BottomNav';
// import WidgetHeader from './WidgetHeader';

// const WidgetPopup = ({ onClose }) => {
//   const [activeTab, setActiveTab] = useState('home');

//   const renderContent = () => {
//     switch(activeTab) {
//       case 'home':
//         return <HomePage />;
//       case 'messages':
//         return <MessagesPage />;
//       case 'help':
//         return <HelpPage />;
//       default:
//         return <HomePage />;
//     }
//   };

//   return (
//     <div className="widget-popup">
//       <WidgetHeader onClose={onClose} />
//       <div className="widget-content">
//         {renderContent()}
//       </div>
//       <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
//     </div>
//   );
// };

// export default WidgetPopup;

// import { useState } from 'react';
// import HelpPage from '../pages/HelpPage';
// import HomePage from '../pages/HomePage';
// import MessagesPage from '../pages/MessagesPage';
// import '../Widget.css';
// import BottomNav from './BottomNav';
// import WidgetHeader from './WidgetHeader';

// const WidgetPopup = ({ onClose }) => {
//   const [activeTab, setActiveTab] = useState('home');

//   const renderContent = () => {
//     switch(activeTab) {
//       case 'home':
//         return <HomePage />;
//       case 'messages':
//         return <MessagesPage />;
//       case 'help':
//         return <HelpPage />;
//       default:
//         return <HomePage />;
//     }
//   };

//   return (
//     <div className="widget-popup">
//       <WidgetHeader onClose={onClose} />
//       <div className="widget-content">
//         {renderContent()}
//       </div>
//       <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
//     </div>
//   );
// };

// export default WidgetPopup;

import { useEffect, useState } from "react";
import HelpPage from "../pages/HelpPage";
import HomePage from "../pages/HomePage";
import MessagesPage from "../pages/MessagesPage";
import "../Widget.css";
import BottomNav from "./BottomNav";
import WidgetHeader from "./WidgetHeader";

const WidgetPopup = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("home");
  const [studentId, setStudentId] = useState(null);

  // Fetch studentId from localStorage (or replace with prop if you have it)
  useEffect(() => {
    const id = localStorage.getItem("studentId"); 
    if (id) setStudentId(id);
    else console.error("❌ studentId not found in localStorage!");
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage />;
      case "messages":
        // Only render MessagesPage if we have a studentId
        return studentId ? (
          <MessagesPage studentId={studentId} />
        ) : (
          <p>Loading messages...</p>
        );
      case "help":
        return <HelpPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="widget-popup">
      <WidgetHeader onClose={onClose} />
      <div className="widget-content">{renderContent()}</div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default WidgetPopup;
