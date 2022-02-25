import { Story as ParsedStory } from "inkjs/compiler/Parser/ParsedHierarchy/Story";

const isIterable = (x: unknown): boolean => !!x?.[Symbol.iterator];

export const locate = (parsedStory: ParsedStory|undefined, lineIndex: number, charInLineIndex: number): string[]|null => {
    if(parsedStory === undefined) return ["Could not parse story"];
    
    // const range = state.selection.ranges[0];
    // let line = state.doc.lineAt(range.head)
    // let lineIndex = line.number;
    // let charInLineIndex = (range.head - line.from)

    const eltIsEmpty = (elt: any) => (elt.GetType() == "Text" && elt.text == "\n")

    const cursorInElement = (lineIndex: number, charInLineIndex: number, dm: any) => (
        lineIndex >= dm.startLineNumber && lineIndex <= dm.endLineNumber
                && ( 
                    dm.startLineNumber != dm.endLineNumber && (
                            lineIndex == dm.startLineNumber && charInLineIndex >= dm.startCharacterNumber
                        || lineIndex == dm.endLineNumber && charInLineIndex < dm.endCharacterNumber   
                        || lineIndex > dm.startLineNumber && lineIndex < dm.endLineNumber
                    )
                 || dm.startLineNumber == dm.endLineNumber && (
                    charInLineIndex >= dm.startCharacterNumber && charInLineIndex < dm.endCharacterNumber
                    )
                )
    )


    const _locate = (subHierarchy: any, accumulator: any[] = []): any[]|null => {
        if(subHierarchy.debugMetadata !== null && !cursorInElement(lineIndex, charInLineIndex, subHierarchy.debugMetadata)){
            return null;
        }

        if(    !isIterable(subHierarchy.content) 
            || subHierarchy.content.length == 0
            ){
            const dm = subHierarchy.debugMetadata;
            if(dm === null){
                return null;
            }

            if( cursorInElement(lineIndex, charInLineIndex, dm)){
                const newAcc = [...accumulator].concat(subHierarchy)
                return newAcc;
            }

            return null;
        }

        let children = subHierarchy.content
        //TODO : add other children

        const founds = []
        for(let c of children){
            const newAcc = [...accumulator].concat(subHierarchy)
            const found = _locate(c, newAcc)
            if(found === null) continue;

            if(found.length > 0 && eltIsEmpty(found[found.length-1])){
                found.splice(-1, 1)
            }

            founds.push(found);
        }
        founds.sort( (f1, f2) => f2.length - f1.length )

        if(founds.length > 0) {
            return founds[0];
        }
        return [...accumulator].concat(subHierarchy);
    }

    const located  = _locate(parsedStory);
    // console.log(located?.map(l => {
    //     if(!l.debugMetadata) return l;
    //     const dm = l.debugMetadata;
    //     return [l,`${dm.startLineNumber}:${dm.startCharacterNumber} ${dm.endLineNumber}:${dm.endCharacterNumber}`]
    // }))
    return located?.map(e => e.GetType()) || []
}