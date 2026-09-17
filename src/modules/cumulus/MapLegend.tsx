import React, { Component } from 'react';
import './MapLegend.css';

interface LegendData {
  levels: { [key: string]: string };
  hex_palette: { [key: string]: string };
}

export interface MapLegendProps {
  data: LegendData;
  title?: string;
  labelInterval?: number;
  width?: string;
  className?: string;
}

class MapLegend extends Component<MapLegendProps> {
  static defaultProps = {
    title: 'Key: precipitation, mm',
    labelInterval: 5,
    width: '800px',
    className: '',
  };

  private getStartNumber = (level: string): number => {
    return parseInt(level.split('_')[0], 10);
  };

  private getLegendItems = () => {
    const { data } = this.props;
    return Object.keys(data.levels)
      .map((key) => ({
        id: parseInt(key, 10),
        level: data.levels[key],
        color: data.hex_palette[key],
      }))
      .sort((a, b) => a.id - b.id);
  };

  private getLabelPositions = () => {
    // Not used for discrete bins; kept for compatibility if needed later.
    const items = this.getLegendItems();
    return items.map((item, index) => ({
      position: (index / (items.length - 1)) * 100,
      label: this.getStartNumber(item.level).toString(),
    }));
  };

  private getGradientColors = (): string => {
    const items = this.getLegendItems();
    return items.map((item) => item.color).join(', ');
  };

  render() {
    const { title, width, className } = this.props;
    const gradientColors = this.getGradientColors();
    const items = this.getLegendItems();
    const labelPositions = this.getLabelPositions();

    return (
      <div className={`map-legend ${className}`} style={{ width: width }}>
        {title && <div className="map-legend-title">{title}</div>}

        <div className="map-legend-content">
          {/* Discrete Color Bins */}
          <div className="color-bar">
            {items.map((item) => (
              <div
                key={item.id}
                className="bin"
                style={{
                  backgroundColor: item.color,
                  width: `${100 / items.length}%`,
                }}
                title={item.level.replace('_', '–')}
              />
            ))}
          </div>

          {/* Labels for each bin */}
          <div className="labels-container bins">
            {items.map((item) => (
              <div key={item.id} className="label bin-label">
                {item.level.replace('_', '–')}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  private getLabelTransform = (index: number, totalLabels: number): string => {
    if (index === 0) return 'translateX(0)';
    if (index === totalLabels - 1) return 'translateX(-100%)';
    return 'translateX(-50%)';
  };
}

export default MapLegend;
