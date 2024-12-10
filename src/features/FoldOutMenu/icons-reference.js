{
  /*import {
  BsGlobe2,
  BsFillPenFill,
  BsFillPinFill,
  BsMap,
  BsPinMap,
  BsNewspaper,
  BsFunnelFill,
} from 'react-icons/bs';*/
}
import React from 'react';

//export default function IconReference ({ name }) {
//
//    function Draw () { return <BsFillPenFill /> };
//    function ReadMe () { return <BsNewspaper /> };
//    function Feedback () { return <BsGlobe2 /> };
//    function Plot () { return <BsFillPinFill /> };
//    function Subset () { return <BsFunnelFill /> };
//
//    const reference = {
//        'draw': Draw,
//        'readme': ReadMe,
//        'feedback': Feedback,
//        'plot': Plot,
//        'subset': Subset,
//    };
//
//    const Component = reference[name];
//
//    return <Component />
//}

export default function IconReference({ name }) {
  return TextToComponent(name);
}

function TextToComponent(text) {
  return (
    <div>
      <p className="iconText">{text}</p>
    </div>
  );
}
