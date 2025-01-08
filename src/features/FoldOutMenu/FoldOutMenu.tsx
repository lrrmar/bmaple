import './FoldOutMenu.css';
import React, {
  useRef,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';
import { Icon, SemanticICONS } from 'semantic-ui-react';
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
  const [icons, setIcons] = useState<{ [key: string]: SemanticICONS }>({});
  const alignment = 'FoldOutMenu ' + align;

  useEffect(() => {
    // Provide each source with the cache, filtered by sourceIdentifier
    const childrenIcons: { [key: string]: SemanticICONS } = {};
    React.Children.forEach(children, (el) => {
      if (React.isValidElement<{ id: string; icon: SemanticICONS }>(el)) {
        const id: string = el.props.id;
        const icon: SemanticICONS = el.props.icon;
        if (id && icon) {
          childrenIcons[id] = icon;
        }
      } else {
        return;
      }
    });
    if (childrenIcons) setIcons(childrenIcons);
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
        icons={icons}
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
  let className = 'FoldOut glassTablet';
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
  icons: { [key: string]: SemanticICONS };
  currentFoldOutId: string | null;
  setCurrentFoldOutId: Dispatch<SetStateAction<string | null>>;
}) {
  const alignment = 'IconBar ' + ' ' + align;

  return (
    <div className={alignment}>
      {Object.keys(icons).map((id) => {
        return (
          <MenuIconHandler
            align={align}
            id={id}
            key={id}
            icon={icons[id]}
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
  id,
  key,
  icon,
  currentFoldOutId,
  setCurrentFoldOutId,
}: {
  align: string;
  id: string;
  key: string;
  icon: SemanticICONS;
  currentFoldOutId: string | null;
  setCurrentFoldOutId: Dispatch<SetStateAction<string | null>>;
}) {
  function MenuIcon({
    icon,
    currentFoldOutId,
    setCurrentFoldOutId,
    setIconHovered,
  }: {
    icon: SemanticICONS;
    currentFoldOutId: string | null;
    setCurrentFoldOutId: Dispatch<SetStateAction<string | null>>;
    setIconHovered: Dispatch<SetStateAction<boolean>>;
  }) {
    const [className, setClassName] = useState('menuIcon');

    function onMenuIconClick(
      id: string,
      currentFoldOutId: string | null,
      setCurrentFoldOutId: Dispatch<SetStateAction<string | null>>,
      setIconHovered: Dispatch<SetStateAction<boolean>>,
    ) {
      setIconHovered(false);
      if (id === currentFoldOutId) {
        setCurrentFoldOutId(null);
      } else if (currentFoldOutId === null) {
        setCurrentFoldOutId(id);
      } else {
        setCurrentFoldOutId(null);
        setTimeout(function () {
          setCurrentFoldOutId(id);
        }, 150);
      }
    }

    useEffect(() => {
      if (id === currentFoldOutId) {
        setClassName('menuIcon glassTablet highlighted');
      } else {
        setClassName('menuIcon glassTablet ');
      }
    }, [currentFoldOutId]);
    console.log(id, icon);

    return (
      <div
        className={className}
        onClick={() =>
          onMenuIconClick(
            id,
            currentFoldOutId,
            setCurrentFoldOutId,
            setIconHovered,
          )
        }
        onMouseEnter={() => setIconHovered(true)}
        onMouseLeave={() => setIconHovered(false)}
      >
        {/* hovered && name !== currentFoldOutId && <div className='menuIconHoverMessage'>{name}</div>*/}
        <Icon name={icon} size="large" />
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
        icon={icon}
        currentFoldOutId={currentFoldOutId}
        setCurrentFoldOutId={setCurrentFoldOutId}
        setIconHovered={setIconHovered}
      />
      {iconHovered && id !== currentFoldOutId && <MenuHint name={id} />}
    </div>
  );
}
