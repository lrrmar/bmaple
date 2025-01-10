// @ts-nocheck
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../App';
import type { HashTable } from './FastaHashTables';

interface InitialState {
  baseUrl: string;
  token: string;
  selectedCrrId: string | null;
  selectedRdtId: string | null;
  profileCrrId: string | null;
  profileRdtId: string | null;
  hashTables: HashTable[];
  latestTimeslot: string | null;
  fastaProducts: FastaProduct[];
}

export interface FastaProduct {
  order: number;
  name: string;
  visible: boolean; // whether or not this product is currently visible on the map
}

const initialState: InitialState = {
  baseUrl: 'dev.fastaweather.com',
  selectedCrrId: null,
  selectedRdtId: null,
  profileCrrId: null,
  profileRdtId: null,
  hashTables: [],
  latestTimeslot: null,
  fastaProducts: [ {
    order: 0,
    name: 'CRR',
    visible: true,
  }, {
    order: 1,
    name: 'RDT',
    visible: false
  }],
};

export const fastaSlice = createSlice({
  name: 'fasta',
  initialState,
  reducers: {
    updateSelectedCrrId: (state, id: PayloadAction<string | null>) => {
      console.log("updateSelectedCrrId:" + id.payload);
      state.selectedCrrId = id.payload;
    },
    updateSelectedRdtId: (state, id: PayloadAction<string | null>) => {
      state.selectedRdtId = id.payload;
    },
    updateProfileCrrId: (state, id: PayloadAction<string | null>) => {
      console.log("updateProfileCrrId:" + id.payload);
      state.profileCrrId = id.payload;
    },
    updateProfileRdtId: (state, id: PayloadAction<string | null>) => {
      state.profileRdtId = id.payload;
    },
    updateHashTables: (state, id: PayloadAction<HashTable[]>) => {
      state.hashTables = id.payload;
    },
    updateLatestTimeslot: (state, timeslot: PayloadAction<string | null>) => {
      state.latestTimeslot = timeslot.payload;
    },
    updateFastaProducts: (state, products : FastaProduct[]) => {
      state.fastaProducts = products.payload;
    },
  },
});

export const {
  updateSelectedCrrId,
  updateSelectedRdtId,
  updateProfileCrrId,
  updateProfileRdtId,
  updateHashTables,
  updateLatestTimeslot,
  updateFastaProducts,
} = fastaSlice.actions;

export const selectBaseUrl = (state: RootState) => state.fasta.baseUrl;
export const selectSelectedCrrId = (state: RootState) =>
  state.fasta.selectedCrrId;
export const selectSelectedRdtId = (state: RootState) =>
  state.fasta.selectedRdtId;
export const selectProfileCrrId = (state: RootState) =>
  state.fasta.profileCrrId;
export const selectProfileRdtId = (state: RootState) =>
  state.fasta.profileRdtId;
export const selectHashTables = (state: RootState) => state.fasta.hashTables;
export const selectLatestTimeslot = (state: RootState) => state.fasta.latestTimeslot;
export const selectFastaProducts = (state: RootState) => state.fasta.fastaProducts;
export const selectCrrVisible = (state: RootState) => isProductVisible(state, "CRR");
export const selectRdtVisible = (state: RootState) => isProductVisible(state, "RDT");

const isProductVisible = (state: RootState, productName : string) => {        
  const idxProduct = state.fasta.fastaProducts.findIndex((pr) => pr.name === productName);
  if (idxProduct !== -1) {
      return state.fasta.fastaProducts[idxProduct].visible;
  }
  else {
      return false;
  }
}

export default fastaSlice.reducer;
