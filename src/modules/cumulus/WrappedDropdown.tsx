import React, { useEffect, useRef, useState } from 'react';
import './Dropdown.css';

interface Option {
  value: string | null;
  label: string;
}

interface Props {
  id: string;
  label: string;
  options: Option[];
  value: string | null;
  onSelect: (value: string | null) => void;
}

const WrappedDropdown = ({ id, label, options, value, onSelect }: Props) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    const option = optionRefs.current[active];
    option?.focus();
    option?.scrollIntoView?.({ block: 'nearest' });
  }, [open, active]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !container.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  const choose = (index: number) => {
    onSelect(options[index].value);
    setOpen(false);
    trigger.current?.focus();
  };

  return (
    <div
      className="dropdown-container wrapped-dropdown"
      ref={container}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <span id={`${id}-label`} className="dropdown-label">
        {label}
      </span>
      {options.length <= 1 ? (
        <div className="dropdown-readonly" aria-labelledby={`${id}-label`}>
          {selected?.label ?? options[0]?.label}
        </div>
      ) : (
        <>
          <button
            ref={trigger}
            id={id}
            type="button"
            className="dropdown-select wrapped-dropdown-trigger"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={`${id}-options`}
            aria-labelledby={`${id}-label ${id}-value`}
            onClick={() => {
              setActive(Math.max(0, selectedIndex));
              setOpen(!open);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                setActive(Math.max(0, selectedIndex));
                setOpen(true);
              }
            }}
          >
            <span id={`${id}-value`}>
              {selected?.label ?? 'Select an option'}
            </span>
            <span aria-hidden="true">{open ? '\u25b4' : '\u25be'}</span>
          </button>
          {open && (
            <div
              id={`${id}-options`}
              role="listbox"
              aria-labelledby={`${id}-label`}
              className="wrapped-dropdown-options"
              onKeyDown={(event) => {
                switch (event.key) {
                  case 'ArrowDown':
                    event.preventDefault();
                    setActive((index) => (index + 1) % options.length);
                    break;
                  case 'ArrowUp':
                    event.preventDefault();
                    setActive(
                      (index) => (index + options.length - 1) % options.length,
                    );
                    break;
                  case 'Home':
                    event.preventDefault();
                    setActive(0);
                    break;
                  case 'End':
                    event.preventDefault();
                    setActive(options.length - 1);
                    break;
                  case 'Enter':
                  case ' ':
                    event.preventDefault();
                    choose(active);
                    break;
                  case 'Escape':
                    event.preventDefault();
                    event.stopPropagation();
                    setOpen(false);
                    trigger.current?.focus();
                    break;
                }
              }}
            >
              {options.map((option, index) => (
                <div
                  key={option.value ?? '__unspecified'}
                  role="option"
                  aria-selected={option.value === value}
                  tabIndex={-1}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  className="wrapped-dropdown-option"
                  onFocus={() => setActive(index)}
                  onClick={() => choose(index)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WrappedDropdown;
