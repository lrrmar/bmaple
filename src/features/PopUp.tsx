import React from 'react';


type PopUpProps = {
  showPopUp: boolean;
  closePopUp: () => void;
  children: React.ReactNode;
};

const PopUp: React.FunctionComponent<PopUpProps> = (({ showPopUp, closePopUp, children }) => {
  if (!showPopUp) {
    return null;
  }
  return (
    <div className="PopUp" >
        <button onClick={closePopUp}>close</button>
        {children}
    </div>
  );
});

export default PopUp;
