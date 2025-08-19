import React, { useState, useEffect } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../hooks';

import { selectProfileId } from '../modules/force-nwr/forceNwrSlice';

const ImgViewPort = ({ id, apiUrl }: { id: string; apiUrl: string }) => {
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [ratio, setRatio] = useState<number>(0);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (id) {
      setSrcUrl(apiUrl + '/resourceById/?id=' + id);
    }
  }, [id]);

  useEffect(() => {
    if (srcUrl) {
      const img = new Image();
      img.src = srcUrl;
      setImg(img);
    }
  }, [srcUrl]);
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
  return (
    <div data-ratio={ratio} style={containerStyle}>
      {srcUrl && <img style={imgStyle} src={srcUrl}></img>}
    </div>
  );
};

export default ImgViewPort;
