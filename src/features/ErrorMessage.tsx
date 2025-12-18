import React, { useState, useEffect } from 'react';
import {
  useAppSelector as useSelector,
  useAppDispatch as useDispatch,
} from '../hooks';
import { selectErrorMessage, updateErrorMessage } from '../mapping/mapSlice';

interface Props {
  children?: React.ReactElement;
  style?: { [key: string]: string };
  minimise?: string;
}

const ErrorMessage = (props: Props) => {
  const dispatch = useDispatch();
  const errorMessage = useSelector(selectErrorMessage);

  useEffect(() => {
    setTimeout(() => dispatch(updateErrorMessage(null)), 2000);
  }, [errorMessage]);
  return (
    <div onClick={() => dispatch(updateErrorMessage(null))}>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default ErrorMessage;
