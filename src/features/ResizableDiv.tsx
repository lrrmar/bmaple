import React, { useState, useRef, useEffect } from 'react';
import './resizable.css';

const Corner = ({
  i,
  j,
  left,
  top,
  setPageX,
  setPageY,
  setCurrentI,
  setCurrentJ,
}: {
  i: 0 | 1;
  j: 0 | 1;
  left: number;
  top: number;
  setPageX: React.Dispatch<React.SetStateAction<number>>;
  setPageY: React.Dispatch<React.SetStateAction<number>>;
  setCurrentI: React.Dispatch<React.SetStateAction<0 | 1>>;
  setCurrentJ: React.Dispatch<React.SetStateAction<0 | 1>>;
}) => {
  const mouseDown = useRef(false);

  const radius: number = 5;
  const style: React.CSSProperties = {
    left: left - radius + 'px',
    top: top - radius + 'px',
    width: radius * 2,
    height: radius * 2,
    backgroundColor: '#1133ff',
    borderRadius: '30px',
    zIndex: 100,
    position: 'absolute',
  };
  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault();
        mouseDown.current = true;
        setCurrentI(i);
        setCurrentJ(j);
        window.addEventListener('mouseup', (e) => {
          e.preventDefault();
          mouseDown.current = false;
        });
        window.addEventListener('mousemove', (e) => {
          e.preventDefault();
          if (mouseDown.current) {
            setPageX(e.pageX);
            setPageY(e.pageY);
          }
        });
      }}
      style={style}
    ></div>
  );
};

interface LeftTop {
  left: number;
  top: number;
}

const ResizableDiv = ({ minWidth, children }: { minWidth: number; children: React.ReactElement }) => {
  const [left, setLeft] = useState<number>(minWidth);
  const [top, setTop] = useState<number>(minWidth);
  const [currentI, setCurrentI] = useState<0 | 1>(0);
  const [currentJ, setCurrentJ] = useState<0 | 1>(0);
  const [pageX, setPageX] = useState<number>(0);
  const [pageY, setPageY] = useState<number>(0);
  const [leftTop, setLeftTop] = useState<LeftTop>({ left: 100, top: 100 });
  const [ratio, setRatio] = useState<number>(0);
  const [width, setWidth] = useState<number>(minWidth);
  const [height, setHeight] = useState<number>(minWidth);

  const modifiedChild = React.cloneElement(children, { setRatio: setRatio });
  const childRef = useRef<HTMLDivElement>(null);
  const style: React.CSSProperties = {
    left: left + 'px',
    top: top + 'px',
    width: width + 'px',
    height: height + 'px',
    backgroundColor: '#ffffff',
    zIndex: 100,
    position: 'absolute',
  };


  useEffect(() => {
    // Handle ratio
    if (ratio) { // non-zero
      setHeight(width/ratio)
    }
  }, [width, ratio])


  useEffect(() => {
    // Handle horizontal resizing
    if (!pageX && !pageY) return; // initial render
    if (currentI) { // 1
      const dX = pageX - (left + width);
      if (width + dX < minWidth){
        setWidth(minWidth);
      } else {
        setWidth(width + dX);
      };
    }
    if (!currentI) { // 0
      const dX = pageX - left;
      if (width - dX < minWidth){
        setWidth(minWidth);
      } else {
        setWidth(width - dX);
        setLeft(left + dX);
      };
     }
  }, [pageX]);

  useEffect(() => {
    // Handle vertical resizing
    if (!pageX && !pageY) return; // initial render
    if (currentJ) { // 1
      const dY = pageY - (top + height);
      if (height + dY < minWidth){
        setHeight(minWidth);
      } else if (ratio) {
        setWidth(width + ratio * dY);
      } else {
        setHeight(height + dY);
      };
    }
    if (!currentJ) { // 0
      const dY = pageY - top;
      if (height + dY < minWidth){
        setHeight(minWidth);
      } else if (ratio) {
        setWidth(ratio * (height - dY));
        setTop(top + ratio*dY);
      } else {
        setHeight(height - dY);
        setTop(top + dY);
      };
     }

  }, [pageY]);
  return (
    <div style={style}>
      <Corner
        i={0}
        j={0}
        left={0}
        top={0} 
        setPageX={setPageX}
        setPageY={setPageY}
        setCurrentI={setCurrentI}
        setCurrentJ={setCurrentJ}
      />
      <Corner
        i={1}
        j={0}
        left={width}
        top={0}
        setPageX={setPageX}
        setPageY={setPageY}
        setCurrentI={setCurrentI}
        setCurrentJ={setCurrentJ}
      />
      <Corner
        i={0}
        j={1}
        left={0}
        top={height}
        setPageX={setPageX}
        setPageY={setPageY}
        setCurrentI={setCurrentI}
        setCurrentJ={setCurrentJ}
      />
      <Corner
        i={1}
        j={1}
        left={width}
        top={height}
        setPageX={setPageX}
        setPageY={setPageY}
        setCurrentI={setCurrentI}
        setCurrentJ={setCurrentJ}
      />
      <div ref={childRef}

        style={{width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'stretch', justifyContent: 'center'}} >
        {modifiedChild}
      </div>
    </div>
  );
};

export default ResizableDiv;
