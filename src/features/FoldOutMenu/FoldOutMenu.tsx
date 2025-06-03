import './FoldOutMenu.css';
import React, {
  useRef,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';
import { useAppSelector as useSelector } from '../../hooks';
import { Icon, SemanticICONS } from 'semantic-ui-react';
import IconReference from './icons-reference';
import { selectMenuStyle } from '../../mapping/mapSlice';

function FoldOutItem({
  children,
  id,
  icon,
}: {
  children: React.ReactNode | React.ReactNode[];
  id: string;
  icon: string;
}) {
  return <div>{children}</div>;
}

function FoldOutMenu({
  children,
  align,
  max,
}: {
  children?: React.ReactNode | React.ReactNode[];
  theme: string;
  align: string;
  max?: number;
}) {
  const theme: string = useSelector(selectMenuStyle);
  const [currentFoldOutId, setCurrentFoldOutId] = useState<string | null>(null);
  const [currentFoldOutIds, setCurrentFoldOutIds] = useState<string[]>([]);
  const [currentFoldOut, setCurrentFoldOut] = useState<React.ReactNode | null>(
    null,
  );
  const [currentFoldOuts, setCurrentFoldOuts] = useState<React.ReactNode[]>([]);
  const [currentNotVisible, setCurrentNotVisible] = useState<React.ReactNode[]>(
    [],
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
    let filler: React.ReactNode[] | null = null;
    React.Children.forEach(children, (el) => {
      if (
        React.isValidElement<{
          children: React.ReactNode[];
          id: string;
          icon: string;
        }>(el)
      ) {
        if (el.props.id === currentFoldOutId) filler = el.props.children;
      }
    });
    setCurrentFoldOut(filler);
  }, [currentFoldOutId]);

  useEffect(() => {
    //remove duplicates
    const totals: { [key: string]: number } = {};
    currentFoldOutIds.forEach((id) => (totals[id] = 0));
    currentFoldOutIds.forEach((id) => (totals[id] += 1));
    let filteredFoldOutIds: string[] = currentFoldOutIds.filter(
      (id) => totals[id] % 2 === 1,
    );
    //reorder to match order of icons
    filteredFoldOutIds = Object.keys(icons).filter((id) =>
      filteredFoldOutIds.includes(id),
    );
    const fillers: React.ReactNode[] = [];
    const notVisible: React.ReactNode[] = [];
    React.Children.forEach(children, (el) => {
      if (
        React.isValidElement<{
          children: React.ReactNode[];
          id: string;
          icon: string;
        }>(el)
      ) {
        if (filteredFoldOutIds.includes(el.props.id)) {
          fillers.push(el);
        } else {
          notVisible.push(el);
        }
      }
    });
    let foldOuts: React.ReactNode[] = [];
    foldOuts = fillers.map((f) => {
      if (React.isValidElement(f)) {
        const id = f.props.id;
        return (
          <FoldOut
            key={id}
            style={{
              minHeight: `${44 / filteredFoldOutIds.length}vh`,
              maxHeight: `${88 / filteredFoldOutIds.length}vh`,
              height: 'fit-content',
            }}
            theme={theme}
            currentFoldOutId={id}
          >
            <div style={{ fontWeight: 'bold' }}>{id}</div>
            {f}
          </FoldOut>
        );
      }
    });
    setCurrentFoldOuts(foldOuts);
    setCurrentNotVisible(notVisible);
  }, [currentFoldOutIds, theme]);
  return (
    <div className={alignment}>
      <IconBar
        align={align}
        icons={icons}
        theme={theme}
        currentFoldOutId={currentFoldOutId}
        setCurrentFoldOutId={setCurrentFoldOutId}
        currentFoldOutIds={currentFoldOutIds}
        setCurrentFoldOutIds={setCurrentFoldOutIds}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        {currentFoldOuts}
      </div>
      <div style={{ position: 'absolute', top: '-5000px' }}>
        {currentNotVisible}
      </div>
    </div>
  );
}

function FoldOut({
  children,
  theme,
  style,
  currentFoldOutId,
}: {
  children: React.ReactNode;
  theme: string;
  style: { [key: string]: string };
  currentFoldOutId: string | null;
}) {
  let className = 'FoldOut ' + theme;
  if (currentFoldOutId === null) {
    className += ' closed';
  }
  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
}

function IconBar({
  align,
  icons,
  theme,
  currentFoldOutId,
  setCurrentFoldOutId,
  currentFoldOutIds,
  setCurrentFoldOutIds,
}: {
  align: string;
  icons: { [key: string]: SemanticICONS };
  theme: string;
  currentFoldOutId: string | null;
  setCurrentFoldOutId: Dispatch<SetStateAction<string | null>>;
  currentFoldOutIds: string[];
  setCurrentFoldOutIds: Dispatch<SetStateAction<string[]>>;
}) {
  const alignment = 'IconBar ' + align;

  return (
    <div className={alignment}>
      {Object.keys(icons).map((id) => {
        return (
          <MenuIconHandler
            align={align}
            id={id}
            key={id}
            icon={icons[id]}
            theme={theme}
            currentFoldOutId={currentFoldOutId}
            setCurrentFoldOutId={setCurrentFoldOutId}
            currentFoldOutIds={currentFoldOutIds}
            setCurrentFoldOutIds={setCurrentFoldOutIds}
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
  theme,
  currentFoldOutId,
  setCurrentFoldOutId,
  currentFoldOutIds,
  setCurrentFoldOutIds,
}: {
  align: string;
  id: string;
  key: string;
  icon: SemanticICONS;
  theme: string;
  currentFoldOutId: string | null;
  setCurrentFoldOutId: Dispatch<SetStateAction<string | null>>;
  currentFoldOutIds: string[];
  setCurrentFoldOutIds: Dispatch<SetStateAction<string[]>>;
}) {
  function MenuIcon({
    icon,
    theme,
    currentFoldOutId,
    setCurrentFoldOutId,
    currentFoldOutIds,
    setCurrentFoldOutIds,
    setIconHovered,
  }: {
    icon: SemanticICONS;
    theme: string;
    currentFoldOutId: string | null;
    setCurrentFoldOutId: Dispatch<SetStateAction<string | null>>;
    currentFoldOutIds: string[];
    setCurrentFoldOutIds: Dispatch<SetStateAction<string[]>>;
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
      setCurrentFoldOutIds([...currentFoldOutIds, id]);
    }

    useEffect(() => {
      //remove duplicates
      const totals: { [key: string]: number } = {};
      currentFoldOutIds.forEach((id) => (totals[id] = 0));
      currentFoldOutIds.forEach((id) => (totals[id] += 1));
      const filteredFoldOutIds: string[] = currentFoldOutIds.filter(
        (id) => totals[id] % 2 === 1,
      );
      if (filteredFoldOutIds.includes(id)) {
        setClassName('menuIcon highlighted ' + theme);
      } else {
        setClassName('menuIcon ' + theme);
      }
    }, [currentFoldOutIds]);

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

  function MenuHint({ name, theme }: { name: string; theme: string }) {
    const className = 'menuHint ' + theme;
    return (
      <div className={className}>
        <p className="menuHintText"> {name} </p>
      </div>
    );
  }
  return (
    <div className={alignment}>
      <MenuIcon
        icon={icon}
        theme={theme}
        currentFoldOutId={currentFoldOutId}
        setCurrentFoldOutId={setCurrentFoldOutId}
        currentFoldOutIds={currentFoldOutIds}
        setCurrentFoldOutIds={setCurrentFoldOutIds}
        setIconHovered={setIconHovered}
      />
      {iconHovered && id !== currentFoldOutId && (
        <MenuHint name={id} theme={theme} />
      )}
    </div>
  );
}

export { FoldOutMenu, FoldOutItem };
