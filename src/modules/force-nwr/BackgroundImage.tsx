import React, { CSSProperties, useState, useEffect } from 'react';
import { useAppDispatch as useDispatch } from '../../hooks';
import { updateBackgroundImageLoaded } from './forceNwrSlice';

const BackgroundImage = () => {
  const dispatch = useDispatch();
  return (
    <img
      src={`${process.env.PUBLIC_URL}/blencathra-2.jpg`}
      style={{
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        inset: 0,
        objectFit: 'cover',
        zIndex: 1,
      }}
      onLoad={() => dispatch(updateBackgroundImageLoaded())}
    />
  );
};
export default BackgroundImage;
