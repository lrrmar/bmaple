import * as fs from "fs";
import { patchDocument,PatchType, TextRun } from "docx";


patchDocument({
    outputType: "nodebuffer",
    data: fs.readFileSync("Cnnn Sortie Brief v7 (2020-01-28).doc"),
    patches: {
        name: {
            type: PatchType.PARAGRAPH,
            children: [new TextRun("Max")],
        },
    },
}).then((doc) => {
    fs.writeFileSync("My Document.docx", doc);
});

export const foo = '';
