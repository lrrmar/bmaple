import React, { Component } from 'react';
import './MapLegend.css';

interface LegendData {
  levels: { [key: string]: string };
  hex_palette: { [key: string]: string };
}

interface MapLegendProps {
  data: LegendData;
  title?: string;
  labelInterval?: number;
  width?: string;
  className?: string;
}

class MapLegend extends Component<MapLegendProps> {
  static defaultProps = {
    title: 'Key: onset day of year',
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
    const { labelInterval = 5 } = this.props;
    const items = this.getLegendItems();

    const labels = items
      .filter(
        (_, index) => index % labelInterval === 0 || index === items.length - 1,
      )
      .map((item) => ({
        position: (item.id / (items.length - 1)) * 100,
        label: this.getStartNumber(item.level).toString(),
      }));

    // Ensure first and last are included
    const hasFirst = labels.some((l) => l.position === 0);
    const hasLast = labels.some((l) => l.position === 100);

    if (!hasFirst && items.length > 0) {
      labels.unshift({
        position: 0,
        label: this.getStartNumber(items[0].level).toString(),
      });
    }

    if (!hasLast && items.length > 0) {
      labels.push({
        position: 100,
        label: this.getStartNumber(items[items.length - 1].level).toString(),
      });
    }

    return labels.sort((a, b) => a.position - b.position);
  };

  private getGradientColors = (): string => {
    const items = this.getLegendItems();
    return items.map((item) => item.color).join(', ');
  };

  render() {
    const { title, width, className } = this.props;
    const gradientColors = this.getGradientColors();
    const labelPositions = this.getLabelPositions();

    return (
      <div className={`map-legend ${className}`} style={{ width: width }}>
        {title && <div className="map-legend-title">{title}</div>}

        <div className="map-legend-content">
          {/* Color Bar */}
          <div
            className="color-bar"
            style={{
              background: `linear-gradient(to right, ${gradientColors})`,
            }}
          >
            {/* Label markers */}
            {labelPositions.map((pos, index) => (
              <div
                key={index}
                className="label-marker"
                style={{ left: `${pos.position}%` }}
              />
            ))}
          </div>

          {/* Labels */}
          <div className="labels-container">
            {labelPositions.map((pos, index) => (
              <div
                key={index}
                className="label"
                style={{
                  left: `${pos.position}%`,
                  transform: this.getLabelTransform(
                    index,
                    labelPositions.length,
                  ),
                }}
              >
                {pos.label}
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
