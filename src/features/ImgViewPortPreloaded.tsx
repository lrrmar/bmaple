import React, { useState, useEffect, useRef } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../hooks';

import { selectProfileId } from '../modules/force-nwr/forceNwrSlice';

const ImgViewPort = ({ id }: { id: string }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const image = document.getElementById(id);
    if (image && containerRef.current) {
      const copy = image.cloneNode(true) as HTMLImageElement;
      copy.style.maxWidth = '100%';
      copy.style.maxHeight = '100%';
      copy.style.height = 'auto';
      copy.style.width = 'auto';
      copy.style.display = 'block';
      copy.style.opacity = '1';
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(copy);
    }
  }, [id]);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const imgStyle: React.CSSProperties = {
    maxHeight: '100%',
    maxWidth: '100%',
    width: 'auto',
    height: 'auto',
    display: 'block',
  };
  return <div ref={containerRef} style={containerStyle}></div>;
};

export default ImgViewPort;
