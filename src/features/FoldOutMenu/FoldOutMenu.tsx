import './FoldOutMenu.css';
import React, {
  useRef,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';
import IconReference from './icons-reference';

export default function FoldOutMenu({
  children,
  align,
}: {
  children?: React.ReactNode | React.ReactNode[];
  align: string;
}) {
  const [currentFoldOutId, setCurrentFoldOutId] = useState<string | null>(null);
  const [currentFoldOut, setCurrentFoldOut] = useState<React.ReactNode | null>(
    null,
  );
  const [foldOutIds, setFoldOutIds] = useState<string[]>([]);
  const alignment = 'FoldOutMenu ' + align;
  const icons = [];

  useEffect(() => {
    // Provide each source with the cache, filtered by sourceIdentifier
    const childrenIds: string[] | null | undefined = React.Children.map(
      children,
      (el) => {
        if (React.isValidElement<{ id: string }>(el)) {
          const id: string = el.props.id;
          return id;
        } else {
          return;
        }
      },
    );
    if (childrenIds) setFoldOutIds(childrenIds);
  }, [children]);

  useEffect(() => {
    // Provide each source with the cache, filtered by sourceIdentifier
    let filler: React.ReactNode | null;
    React.Children.forEach(children, (el) => {
      if (React.isValidElement<{ id: string }>(el)) {
        if (el.props.id === currentFoldOutId) filler = el;
        return el;
      }
    });
    setCurrentFoldOut(filler);
  }, [currentFoldOutId]);

  return (
    <div className={alignment}>
      <IconBar
        align={align}
        icons={foldOutIds}
        currentFoldOutId={currentFoldOutId}
        setCurrentFoldOutId={setCurrentFoldOutId}
      />
      <FoldOut currentFoldOutId={currentFoldOutId}>{currentFoldOut}</FoldOut>
    </div>
  );
}

function FoldOut({
  children,
  currentFoldOutId,
}: {
  children: React.ReactNode;
  currentFoldOutId: string | null;
}) {
  let className = 'FoldOut';
  if (currentFoldOutId === null) {
    className += ' closed';
  }
  return <div className={className}>{children}</div>;
}

function IconBar({
  align,
  icons,
  currentFoldOutId,
  setCurrentFoldOutId,
}: {
  align: string;
  icons: string[];
  currentFoldOutId: string | null;
  setCurrentFoldOutId: Dispatch<SetStateAction<string | null>>;
}) {
  const alignment = 'IconBar ' + align;

  return (
    <div className={alignment}>
      {icons.map((icon) => {
        return (
          <MenuIconHandler
            align={align}
            name={icon}
            key={icon}
            currentFoldOutId={currentFoldOutId}
            setCurrentFoldOutId={setCurrentFoldOutId}
          />
        );
      })}
    </div>
  );
}

function MenuIconHandler({
  align,
  name,
  currentFoldOutId,
  setCurrentFoldOutId,
}: {
  align: string;
  name: string;
  currentFoldOutId: string | null;
  setCurrentFoldOutId: Dispatch<SetStateAction<string | null>>;
}) {
  function MenuIcon({
    name,
    currentFoldOutId,
    setCurrentFoldOutId,
    setIconHovered,
  }: {
    name: string;
    currentFoldOutId: string | null;
    setCurrentFoldOutId: Dispatch<SetStateAction<string | null>>;
    setIconHovered: Dispatch<SetStateAction<boolean>>;
  }) {
    const [className, setClassName] = useState('menuIcon');

    function onMenuIconClick(
      name: string,
      currentFoldOutId: string | null,
      setCurrentFoldOutId: Dispatch<SetStateAction<string | null>>,
      setIconHovered: Dispatch<SetStateAction<boolean>>,
    ) {
      setIconHovered(false);
      if (name === currentFoldOutId) {
        setCurrentFoldOutId(null);
      } else if (currentFoldOutId === null) {
        setCurrentFoldOutId(name);
      } else {
        setCurrentFoldOutId(null);
        setTimeout(function () {
          setCurrentFoldOutId(name);
        }, 150);
      }
    }

    useEffect(() => {
      if (name === currentFoldOutId) {
        setClassName('menuIcon highlighted');
      } else {
        setClassName('menuIcon');
      }
    }, [currentFoldOutId]);

    return (
      <div
        className={className}
        onClick={() =>
          onMenuIconClick(
            name,
            currentFoldOutId,
            setCurrentFoldOutId,
            setIconHovered,
          )
        }
        onMouseEnter={() => setIconHovered(true)}
        onMouseLeave={() => setIconHovered(false)}
      >
        {/* hovered && name !== currentFoldOutId && <div className='menuIconHoverMessage'>{name}</div>*/}
        <IconReference name={name} />
      </div>
    );
  }

  const [iconHovered, setIconHovered] = useState(false);
  const alignment = 'menuIconHandler ' + align;

  function MenuHint({ name }: { name: string }) {
    return (
      <div className="menuHint">
        <p className="menuHintText"> {name} </p>
      </div>
    );
  }
  return (
    <div className={alignment}>
      <MenuIcon
        name={name}
        currentFoldOutId={currentFoldOutId}
        setCurrentFoldOutId={setCurrentFoldOutId}
        setIconHovered={setIconHovered}
      />
      {iconHovered && name !== currentFoldOutId && <MenuHint name={name} />}
    </div>
  );
}
