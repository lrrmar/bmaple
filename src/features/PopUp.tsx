import React from 'react';
import './PopUp.css';

type PopUpProps = {
  showPopUp: boolean;
  closePopUp: () => void;
  children: React.ReactNode;
};

const PopUp: React.FunctionComponent<PopUpProps> = ({
  showPopUp,
  closePopUp,
  children,
}) => {
  if (!showPopUp) {
    return null;
  }
  return (
    <div className="popUp">
      {children}
      <button onClick={closePopUp}>close</button>
    </div>
  );
};

export default PopUp;
