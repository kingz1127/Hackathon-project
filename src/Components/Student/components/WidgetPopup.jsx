import { useState } from 'react';
import HelpPage from '../pages/HelpPage';
import HomePage from '../pages/HomePage';
import MessagesPage from '../pages/MessagesPage';
import '../Widget.css';
import BottomNav from './BottomNav';
import WidgetHeader from './WidgetHeader';

const WidgetPopup = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return <HomePage />;
      case 'messages':
        return <MessagesPage />;
      case 'help':
        return <HelpPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="widget-popup">
      <WidgetHeader onClose={onClose} />
      <div className="widget-content">
        {renderContent()}
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default WidgetPopup;