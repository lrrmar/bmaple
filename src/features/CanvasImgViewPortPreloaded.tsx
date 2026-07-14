import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../hooks';

const CanvasImgViewPort = ({
  profileId,
  configChange,
}: {
  profileId: string | null;
  configChange: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  //const [id, setId] = useState<string | null>(null);
  const canvasDimensions = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [resize, setResize] = useState<number>(0);

  useEffect(() => {
    // On config change or init render, we can get the size of the canvas
    const canvas = canvasRef.current;
    const canvasSize = 1080;
    let canvasWidth = 0;
    let canvasHeight = 0;
    if (canvas) {
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
      }
    }
    setResize(resize + (1 % 2));
  }, [configChange]);

  useEffect(() => {
    // On a resize or a change of profile, we redraw
    // The repeated canvas dimension process is required since we on a resize
    // or init render as we need to first find out the size of the parent which
    // we cannot track in react due to it coming after state change.
    const id = profileId;
    const canvasSize = 1080;
    let canvasWidth = 0;
    let canvasHeight = 0;
    const canvas = canvasRef.current;
    if (!id && canvas) {
      const ctx = canvas.getContext('2d');
      //console.log(ctx);
      //console.log(canvas.width, canvas.height);
      if (ctx) ctx.clearRect(0, 0, 10000, 10000);
    }
    if (id && canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        const parentWidth = parent.getClientRects()[0].width;
        const parentHeight = parent.getClientRects()[0].height;
        const parentAspectRatio = parentWidth / parentHeight;
        if (parentAspectRatio <= 1) {
          // landscape
          canvasWidth = canvasSize;
          canvasHeight = canvasSize / parentAspectRatio;
        } else {
          // portrait
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
              imageHeight = imageWidth / imageAspectRatio;
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
  }, [profileId, resize]);

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
