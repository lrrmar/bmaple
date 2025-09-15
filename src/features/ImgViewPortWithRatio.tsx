import React, { useState, useEffect } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../hooks';

const ImgViewPort = ({
  id,
  setRatio,
}: {
  id: string;
  setRatio?: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const apiUrl = 'http://localhost:8383';
  useEffect(() => {
    if (id) {
      setSrcUrl(apiUrl + '/resourceById?id=' + id);
    }
  }, [id]);

  useEffect(() => {
    if (setRatio && srcUrl) {
      const img = new Image();
      img.src = srcUrl;
      img.onload = () => {
        setRatio(img.naturalWidth / img.naturalHeight);
        setImg(img);
      };
    }
  }, [srcUrl]);
  const style: React.CSSProperties = {
    maxHeight: '100%',
    maxWidth: '100%',
  };
  return (
    <div style={style}>{img && <img src={img.src} style={style}></img>}</div>
  );
};

export default ImgViewPort;
