import React, { CSSProperties, useState, useEffect } from 'react';
import { PropagateLoader as Loader } from 'react-spinners';
import { useAppSelector as useSelector } from '../../hooks';

import { selectPreloadComplete } from './forceNwrSlice';

const LoadingScreen = () => {
  const transitionTime = 5000;
  const [loading, setLoading] = useState<boolean>(true);
  const [style, setStyle] = useState<CSSProperties>({
    zIndex: 1000,
    height: '100vh',
    width: '100vw',
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EBF3F3',
    transition: `opacity ${transitionTime}ms ease-in`,
    opacity: 1,
  });

  const preloadComplete = useSelector(selectPreloadComplete);

  useEffect(() => {
    if (preloadComplete) {
      setStyle(style0);
    }
  }, [preloadComplete]);

  useEffect(() => {
    setTimeout(() => setLoading(false), transitionTime);
  }, [style]);

  const style0 = { ...style };
  style0['opacity'] = 0;

  return loading ? (
    <div style={style}>
      <Loader color={'#186F4D'} />
    </div>
  ) : null;
};
export default LoadingScreen;
