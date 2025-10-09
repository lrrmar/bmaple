import {
  BsGlobe2,
  BsFillPenFill,
  BsFillPinFill,
  BsMap,
  BsPinMap,
  BsNewspaper,
  BsFunnelFill,
  BsExclamationTriangleFill,
  BsKeyFill,
  BsCloudDrizzle,
  BsExclamationCircle,
  BsSliders,
} from 'react-icons/bs';

import React from 'react';

export default function IconReference({ name }) {
  function Draw() {
    return <BsFillPenFill />;
  }
  function ReadMe() {
    return <BsNewspaper />;
  }
  function Feedback() {
    return <BsGlobe2 />;
  }
  function Plot() {
    return <BsFillPinFill />;
  }
  function Subset() {
    return <BsFunnelFill />;
  }
  function Alert() {
    return <BsExclamationTriangleFill />;
  }
  function CrrKey() {
    return (
      <div>
        <BsCloudDrizzle />
        <BsKeyFill />{' '}
      </div>
    );
  }
  function CapKey() {
    return (
      <div>
        <BsExclamationTriangleFill />
        <BsKeyFill />{' '}
      </div>
    );
  }
  function Slider() {
    return <BsSliders />;
  }

  const reference = {
    draw: Draw,
    readme: ReadMe,
    feedback: Feedback,
    plot: Plot,
    subset: Subset,
    alerts: Alert,
    'CRR-Key': CrrKey,
    'CAP-Key': CapKey,
    Options: Slider,
  };

  const Component = reference[name];
  if (!Component) {
    return <BsExclamationCircle />;
  }

  return <Component />;
}

// export default function IconReference({ name }) {
//   return TextToComponent(name);
// }

// function TextToComponent(text) {
//   return (
//     <div>
//       <p className="iconText">{text}</p>
//     </div>
//   );
// }
