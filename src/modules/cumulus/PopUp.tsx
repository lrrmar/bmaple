import React, { useEffect, useRef, useState } from 'react';
import { Overlay } from 'ol';
import { Feature } from 'ol';
import { GeoJSONFeatureData } from './PopUpListener';
import './Popup.css';
import { transform } from 'ol/proj';

interface PopupProps {
  map: any; // OpenLayers map instance
  feature: GeoJSONFeatureData | null;
  coordinate: number[];
  onClose?: () => void;
}

// Create overlay ONCE outside component
let overlay: Overlay | null = null;

const Popup: React.FC<PopupProps> = ({ map, feature, coordinate, onClose }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  //const overlayRef = useRef<Overlay | null>(null);
  const [content, setContent] = useState<string>('');

  // Initialize overlay once
  useEffect(() => {
    if (!map || !popupRef.current) return;

    overlay = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center', // Arrow/tip at bottom center points to coordinate
      offset: [0, 0],
      stopEvent: false,
    });

    map.addOverlay(overlay);

    return () => {
      if (overlay && map) {
        map.removeOverlay(overlay);
      }
    };
  }, [map]);

  // Update popup position and content when feature/coordinate changes
  useEffect(() => {
    console.log('Update POPUP ');

    if (!overlay) return;

    if (feature && coordinate) {
      // Format feature properties for display
      const formattedContent = formatFeatureContent(feature);
      setContent(formattedContent);

      // Show popup at coordinate
      console.log(
        'Setting position to: ' + coordinate[0] + ',' + coordinate[1],
      );

      const mapCoordinates = transform(coordinate, 'EPSG:4326', 'EPSG:3857');

      overlay.setPosition(mapCoordinates);
    } else {
      // Hide popup
      overlay.setPosition(undefined);
    }
  }, [feature, coordinate]);

  // Format feature properties as HTML
  const formatFeatureContent = (feature: GeoJSONFeatureData): string => {
    //if (displayProps.length === 0) {
    //  return '<div class="popup-empty">No properties available</div>';
    //}

    return `
      <div class="popup-content">
        <table class="popup-table">
          <tbody>
              <tr>
                <td class="popup-key">${feature.dataVariableName}</td>
                <td class="popup-value">${feature.dataValue}</td>
              </tr>              
            </tbody>
        </table>
      </div>
    `;
  };

  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Handle close button click
  const handleClose = () => {
    if (overlay) {
      overlay.setPosition(undefined);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div ref={popupRef} className="ol-popup">
      <div className="popup-header">
        <span className="popup-title">Feature Details</span>
        <button
          className="popup-close"
          onClick={handleClose}
          aria-label="Close popup"
        >
          &times;
        </button>
      </div>

      <div
        className="popup-body"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default Popup;
