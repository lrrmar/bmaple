import React, { useState, useEffect } from 'react';
import { useAppSelector as useSelector } from '../hooks';
import { selectCache } from './cacheSlice';

type Props = {
  children?: React.ReactNode | React.ReactNode[];
};

interface CacheEntry {
  source: string;
  ol_uid: string;
  [key: string]: number | string;
}

interface CacheRequest {
  source: string;
}

interface ChildProps {
  sourceIdentifier: string;
  cache?: { [key: string]: CacheEntry | CacheRequest };
}

const Sources = ({ children }: Props) => {
  const cache = useSelector(selectCache);
  const [childrenWithCache, setChildrenWithCache] = useState<React.ReactNode[]>(
    [],
  );
  useEffect(() => {
    // Provide each source with the cache, filtered by sourceIdentifier
    if (!cache) return;
    const childrenWithCache = React.Children.map(children, (el) => {
      if (React.isValidElement<ChildProps>(el)) {
        const sourceIdentifier: string = el.props.sourceIdentifier;
        const cacheForChild = cache;
        Object.keys(cache).forEach((key) => {
          if (cacheForChild[key].source !== sourceIdentifier) {
            delete cacheForChild[key];
          }
        });
        return React.cloneElement(el, {
          sourceIdentifier: sourceIdentifier,
          cache: cacheForChild,
        });
      }
      console.log(childrenWithCache);
    });
  }, [cache]);
  return <div className="Sources">{childrenWithCache}</div>;
};

export default Sources;
