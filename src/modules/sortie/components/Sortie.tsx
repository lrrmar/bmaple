import React, {
  useEffect,
  useState,
  type SetStateAction,
  type Dispatch,
} from 'react';
import { Icon, SemanticICONS } from 'semantic-ui-react';

import { OptionProp, OptionsMenu } from './OptionsMenu';
import Info from './Info';
import Waypoints from './Waypoints';
import FlightPlan from './FlightPlan';
import Overlays from './Overlays';
import Download from './Download';
import { type SortieInfo } from '../types';

type PageName = 'info' | 'waypoints' | 'flight' | 'download' | 'overlays';

const BACKGROUND = 'rgba(255, 255, 255, 255)';
const PRIMARY = '#252243';
const SECONDARY = '#0abbef';

const SideBar = ({
  pages,
  openPage,
  setOpenPage,
}: {
  pages: [PageName, SemanticICONS][];
  openPage: PageName;
  setOpenPage: Dispatch<SetStateAction<PageName>>;
}) => {
  const [optionIcons, setOptionIcons] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    setOptionIcons(
      pages.map((page) => {
        return (
          <div
            key={page[0]}
            style={{
              height: '40px',
              width: '40px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: page[0] == openPage ? PRIMARY : SECONDARY,
              backgroundColor: page[0] == openPage ? SECONDARY : PRIMARY,
            }}
            onClick={() => setOpenPage(page[0])}
          >
            <Icon name={page[1]} size={'large'} />
          </div>
        );
      }),
    );
  }, [openPage]);

  return (
    <div style={{ height: '100vh', backgroundColor: PRIMARY }}>
      {optionIcons}
    </div>
  );
};

const Page = ({
  component,
  zIndex,
}: {
  component: React.ReactNode;
  zIndex: number;
}) => {
  const [style, setStyle] = useState<React.CSSProperties>({});
  return (
    <div
      style={{
        zIndex: zIndex,
        position: 'absolute',
        left: '40px',
        top: '0',
        bottom: '0',
        right: '50vw',
        backgroundColor: BACKGROUND,
        borderWidth: '4px',
        borderStyle: 'solid',
        borderColor: SECONDARY,
        overflow: 'scroll',
      }}
    >
      {component}
    </div>
  );
};

const Sortie = () => {
  const [options, setOptions] = useState<OptionProp[]>([]);
  const [optionsMessage, setOptionsMessage] = useState<string | undefined>();
  const [openPage, setOpenPage] = useState<PageName>('info');
  const [pageComponents, setPageComponents] = useState<React.ReactNode[]>([]);
  const [pages, setPages] = useState<Record<PageName, React.ReactNode>>();

  const [sortieInfo, setSortieInfo] = useState<SortieInfo>({
    'Mission Scientist': '',
    Author: '',
    Approver: '',
    'Scientific Aims': '',
    'Planned T/O Time': '0900',
    'Departure Airport': '',
    'Landing Airport': '',
    'FIRS / Zones': '',
    'Weather Conditions': '',
    'Instrument Servicability': '',
    'Special Notes ': '',
  });

  const topZIndex = 12;
  const bottomZIndex = 11;

  useEffect(() => {
    setPages({
      info: <Info sortieInfo={sortieInfo} setSortieInfo={setSortieInfo} />,
      waypoints: <Waypoints />,
      flight: (
        <FlightPlan
          sortieInfo={sortieInfo}
          setSortieInfo={setSortieInfo}
          setOptions={setOptions}
          setOptionsMessage={setOptionsMessage}
        />
      ),
      download: <Download />,
      overlays: <Overlays />,
    });
  }, [sortieInfo]);

  useEffect(() => {
    if (pageComponents && pages) {
      const newPageComponents = [];
      const entries = Object.entries(pages) as [PageName, React.ReactNode][];
      for (let i = 0; i < entries.length; i++) {
        const page = entries[i][0];
        const component = entries[i][1];
        const zIndex = openPage == page ? topZIndex : bottomZIndex;
        newPageComponents.push(<Page zIndex={zIndex} component={component} />);
      }
      setPageComponents(newPageComponents);
    }
  }, [pages, openPage, sortieInfo]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SideBar
          pages={[
            ['info', 'list ul'],
            ['waypoints', 'flag'],
            ['flight', 'plane'],
            ['download', 'download'],
            ['overlays', 'map'],
          ]}
          openPage={openPage}
          setOpenPage={setOpenPage}
        />
        {pageComponents}
      </div>
      <OptionsMenu message={optionsMessage} options={options} />
    </div>
  );
};

export default Sortie;
