import { dateAsUrlParamString } from './dateFormatHelpers';
import { HashTable } from './FastaHashTables';

function fastaHashTableToUrl(hashTable : HashTable) {
    const time = new Date(hashTable.timeslot);
    var url = `${hashTable.name}/${dateAsUrlParamString(time)}?${hashTable.forecast_slot}`;
    //if (hashTable.forecastSlot !== "0") {
    //    url = url + `?${hashTable.forecast_slot}`;
    //}
    return url;
}

export default fastaHashTableToUrl;
