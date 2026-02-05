import _template from './DocTemplate'
import * as edit from './EditorFunctions';
import { SortieFormKey, SortieFormKeys } from '../types';
import JSZip from "jszip";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { contentTypesXml, relsXml, documentRelsXml } from './XMLExtras';


type PrintSortieArgs = Record<SortieFormKey, string>;

const editFunctions: Record<SortieFormKey, (doc, info: string) => void> = {
    'Mission Scientist': edit.addMissionScientist,
    'Author': edit.addAuthor,
    'Approver': edit.addApprover,
    'Scientific Aims': edit.addScientificAims,
    'Planned T/O Time': edit.addPlannedTOTime,
    'Departure Airport': edit.addDepartureAirport,
    'Landing Airport': edit.addLandingAirport,
    'FIRS / Zones': edit.addFIRSZones,
    'Weather Conditions': edit.addWeatherNoGo,
    'Instrument Servicability': edit.addInstrumentServicability,
    'Special Notes ': edit.addSpecialNotes,
}


async function printSortie(
        args: PrintSortieArgs,
        waypoints: {description: string, coords: string}[], 
        routines: {description: string, duration: string, soFar: string}[]
    )  {

    const response = await fetch("/sortie-template.docx");
    const arrayBuffer = await response.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const xml = await zip.file("word/document.xml")!.async("string");
    const parser = new XMLParser({ ignoreAttributes: false });
    const builder = new XMLBuilder({ ignoreAttributes: false });
    const doc = parser.parse(xml);

    SortieFormKeys.forEach((key: SortieFormKey) => {
        editFunctions[key](doc, args[key]);
    })
    edit.addWaypoints(doc, waypoints);
    edit.addRoutines(doc, routines);

    zip.file("word/document.xml", builder.build(doc));

    const blob = await zip.generateAsync({
        type: "blob",
        mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = 'sortie.docx';
    document.body.appendChild(a);
    a.click();
    
    a.remove();
    URL.revokeObjectURL(url);
}



export default printSortie;
