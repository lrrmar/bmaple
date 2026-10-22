import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Slider from './Slider';
import cumulusReducer, {
  updateSelectedAccumDays,
  updateSelectedDayOfYear,
} from './cumulusSlice';

jest.mock('react-slider', () => ({
  __esModule: true,
  default: ({ onChange }: { onChange: (value: number) => void }) => (
    <button onClick={() => onChange(2)}>Select +72h</button>
  ),
}));

const setup = (runDate: string) => {
  const store = configureStore({ reducer: { cumulus: cumulusReducer } });
  store.dispatch(updateSelectedDayOfYear(runDate));
  render(
    <Provider store={store}>
      <Slider />
    </Provider>,
  );
  return store;
};

test('shows the forecast date and updates it when the run date changes', () => {
  const store = setup('2026-10-07');
  expect(
    screen.getByText('Forecast date: 08 October 2026 (+0024h)'),
  ).toBeTruthy();

  act(() => {
    store.dispatch(updateSelectedDayOfYear('2026-10-09'));
  });
  expect(
    screen.getByText('Forecast date: 10 October 2026 (+0024h)'),
  ).toBeTruthy();
});

test('adds the selected lead time across a year boundary', () => {
  const store = setup('2026-12-30');
  fireEvent.click(screen.getByText('Select +72h'));
  expect(
    screen.getByText('Forecast date: 02 January 2027 (+0072h)'),
  ).toBeTruthy();
  expect(store.getState().cumulus.selectedEntry).toBe('0072h');
});

test('updates the forecast date when accumulation clamps the lead time', () => {
  const store = setup('2028-02-27');
  act(() => {
    store.dispatch(updateSelectedAccumDays(3));
  });
  expect(
    screen.getByText('Forecast date: 01 March 2028 (+0072h)', { exact: false }),
  ).toBeTruthy();
});

test('keeps the forecast date when the run date moves earlier', () => {
  const store = setup('2026-10-07');
  act(() => {
    store.dispatch(updateSelectedDayOfYear('2026-10-05'));
  });
  expect(store.getState().cumulus.selectedEntry).toBe('0072h');
  expect(store.getState().cumulus.selectedForecastDate).toBe('2026-10-08');
});
