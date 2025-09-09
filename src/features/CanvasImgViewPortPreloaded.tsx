import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../hooks';

import { selectProfileId } from '../modules/force-nwr/forceNwrSlice';

const CanvasImgViewPort = ({
  id,
  configChange,
}: {
  id: string | null;
  configChange: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasDimensions = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  useLayoutEffect(() => {
    const canvasSize = 1080;
    let canvasWidth = 0;
    let canvasHeight = 0;
    const canvas = canvasRef.current;
    if (id && canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        const parentWidth = parent.getClientRects()[0].width;
        const parentHeight = parent.getClientRects()[0].height;
        const parentAspectRatio = parentWidth / parentHeight;
        if (parentAspectRatio <= 1) {
          // portrait
          canvasWidth = canvasSize;
          canvasHeight = canvasSize / parentAspectRatio;
        } else {
          // landscape
          canvasHeight = canvasSize;
          canvasWidth = canvasSize * parentAspectRatio;
        }
        canvasDimensions.current = {
          width: canvasWidth,
          height: canvasHeight,
        };
        const image = document.getElementById(id) as HTMLImageElement;
        /* TODO impletement a loading / not available place holder.
       * if (!id) {
        const img = new Image();
        img.src = './blencathra-1.jpg';
        image = img;
      }*/
        if (image && canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const imageAspectRatio = image.width / image.height;
            let imageWidth;
            let imageHeight;
            let widthOffset = 0;
            let heightOffset = 0;
            if (imageAspectRatio <= parentAspectRatio) {
              // 'more' portrait
              imageHeight = canvasHeight;
              imageWidth = imageHeight * imageAspectRatio;
              widthOffset = (canvasWidth - imageWidth) / 2;
            } else {
              // 'more' landscape
              imageWidth = canvasWidth;
              imageHeight = image.height / imageAspectRatio;
              heightOffset = (canvasHeight - imageHeight) / 2;
            }
            ctx.drawImage(
              image,
              widthOffset,
              heightOffset,
              imageWidth,
              imageHeight,
            );
          }
        }
      }
    }
  }, [id, configChange]);

  const canvasStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderWidth: '1px',
  };

  const imgStyle: React.CSSProperties = {
    maxHeight: '100%',
    maxWidth: '100%',
    width: 'auto',
    height: 'auto',
    display: 'block',
  };
  return (
    <canvas
      height={canvasDimensions.current.height}
      width={canvasDimensions.current.width}
      ref={canvasRef}
      style={canvasStyle}
    ></canvas>
  );
};

export default CanvasImgViewPort;
