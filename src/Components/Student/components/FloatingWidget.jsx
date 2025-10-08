import { useState } from 'react';
import '../Widget.css';
import WidgetButton from './WidgetButton';
import WidgetPopup from './WidgetPopup';

const FloatingWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="floating-widget-container">
      <WidgetButton onClick={toggleWidget} isOpen={isOpen} />
      {isOpen && <WidgetPopup onClose={toggleWidget} />}
    </div>
  );
};

export default FloatingWidget;


