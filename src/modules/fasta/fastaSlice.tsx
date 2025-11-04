import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../App';
import type { HashTable } from './FastaHashTables';
import { Root } from 'react-dom/client';

interface InitialState {
  baseUrl: string;
  token: string;
  selectedCrrId: string | null;
  selectedRdtId: string | null;
  selectedLiId: string | null;
  profileCrrId: string | null;
  profileRdtId: string | null;
  profileLiId: string | null;
  hashTables: HashTable[];
  latestTimeslot: number | null; // latest as a unix timestamp
  fastaProducts: FastaProduct[];
  zmFlag: boolean;
  mzFlag: boolean;
  opacityCRR: number;
  opacityRDT: number;
  crrChosenStyle: string;
}

export interface FastaProduct {
  order: number;
  name: string;
  visible: boolean; // whether or not this product is currently visible on the map
}

const initialState: InitialState = {
  baseUrl: 'dev.fastaweather.com',
  token: '1VX7KPWpX91kyecHWLafkIYJ-9yL4lsbKfV43t7HrX0',
  selectedCrrId: null,
  selectedRdtId: null,
  selectedLiId: null,
  profileCrrId: null,
  profileRdtId: null,
  profileLiId: null,
  hashTables: [],
  latestTimeslot: null,
  fastaProducts: [
    {
      order: 0,
      name: 'CRR',
      visible: true,
    },
    {
      order: 1,
      name: 'RDT',
      visible: true,
    },
  ],
  zmFlag: false,
  mzFlag: false,
  opacityCRR: 1,
  opacityRDT: 1,
  crrChosenStyle: 'rainbow',
};

export const fastaSlice = createSlice({
  name: 'fasta',
  initialState,
  reducers: {
    updateSelectedCrrId: (state, id: PayloadAction<string | null>) => {
      state.selectedCrrId = id.payload;
    },
    updateSelectedRdtId: (state, id: PayloadAction<string | null>) => {
      state.selectedRdtId = id.payload;
    },
    updateSelectedLightningId: (state, id: PayloadAction<string | null>) => {
      state.selectedLiId = id.payload;
    },
    updateProfileCrrId: (state, id: PayloadAction<string | null>) => {
      state.profileCrrId = id.payload;
    },
    updateProfileRdtId: (state, id: PayloadAction<string | null>) => {
      state.profileRdtId = id.payload;
    },
    updateProfileLightningId: (state, id: PayloadAction<string | null>) => {
      state.profileLiId = id.payload;
    },
    updateHashTables: (state, id: PayloadAction<HashTable[]>) => {
      state.hashTables = id.payload;
    },
    updateLatestTimeslot: (state, timeslot: PayloadAction<number | null>) => {
      state.latestTimeslot = timeslot.payload;
    },
    updateFastaProducts: (state, products: PayloadAction<FastaProduct[]>) => {
      state.fastaProducts = products.payload;
    },
    updateZmFlag: (state, flag: PayloadAction<boolean>) => {
      state.zmFlag = flag.payload;
    },
    updateMzFlag: (state, flag: PayloadAction<boolean>) => {
      state.mzFlag = flag.payload;
    },
    updateOpacityCRR: (state, opacityLevel: PayloadAction<number>) => {
      state.opacityCRR = opacityLevel.payload;
    },
    updateOpacityRDT: (state, opacityLevel: PayloadAction<number>) => {
      state.opacityRDT = opacityLevel.payload;
    },
    updateCrrChosenStyle: (state, newStyle: PayloadAction<string>) => {
      state.crrChosenStyle = newStyle.payload;
    },
  },
});

export const {
  updateOpacityRDT,
  updateOpacityCRR,
  updateSelectedCrrId,
  updateSelectedRdtId,
  updateSelectedLightningId,
  updateProfileCrrId,
  updateProfileRdtId,
  updateProfileLightningId,
  updateHashTables,
  updateLatestTimeslot,
  updateFastaProducts,
  updateZmFlag,
  updateMzFlag,
  updateCrrChosenStyle,
} = fastaSlice.actions;

export const selectBaseUrl = (state: RootState) => state.fasta.baseUrl;
export const selectToken = (state: RootState) => state.fasta.token;
export const selectSelectedCrrId = (state: RootState) =>
  state.fasta.selectedCrrId;
export const selectSelectedRdtId = (state: RootState) =>
  state.fasta.selectedRdtId;
export const selectSelectedLightningId = (state: RootState) =>
  state.fasta.selectedLiId;
export const selectProfileCrrId = (state: RootState) =>
  state.fasta.profileCrrId;
export const selectProfileRdtId = (state: RootState) =>
  state.fasta.profileRdtId;
export const selectProfileLightningId = (state: RootState) =>
  state.fasta.profileLiId;
export const selectHashTables = (state: RootState) => state.fasta.hashTables;
export const selectLatestTimeslot = (state: RootState) =>
  state.fasta.latestTimeslot;
export const selectFastaProducts = (state: RootState) =>
  state.fasta.fastaProducts;
export const selectCrrVisible = (state: RootState) =>
  isProductVisible(state, 'CRR');
export const selectRdtVisible = (state: RootState) =>
  isProductVisible(state, 'RDT');
export const selectZmFlag = (state: RootState) => state.fasta.zmFlag;
export const selectMzFlag = (state: RootState) => state.fasta.mzFlag;
export const selectOpacityCRR = (state: RootState) => state.fasta.opacityCRR;
export const selectCrrChosenStyle = (state: RootState) =>
  state.fasta.crrChosenStyle;
export const selectOpacityRDT = (state: RootState) => state.fasta.opacityRDT;

const isProductVisible = (state: RootState, productName: string) => {
  const idxProduct = state.fasta.fastaProducts.findIndex(
    (pr) => pr.name === productName,
  );
  if (idxProduct !== -1) {
    return state.fasta.fastaProducts[idxProduct].visible;
  } else {
    return false;
  }
};

export default fastaSlice.reducer;
