import { useRef, useEffect, useState, useCallback } from 'react';
import { EditorState, EditorView, useCodeMirror } from '@uiw/react-codemirror';
import {linter, lintGutter, Diagnostic, forceLinting} from "@codemirror/lint"
import {showPanel, Panel} from "@codemirror/panel"

import { Compiler, CompilerOptions } from 'inkjs/compiler/Compiler';
import { Story as ParsedStory } from "inkjs/compiler/Parser/ParsedHierarchy/Story";

const isIterable = (x: unknown): boolean => !!x?.[Symbol.iterator];
interface Issue{
    type: "ERROR"|"WARNING"|"RUNTIME ERROR"|"RUNTIME WARNING"|"TODO";
    filename: string;
    lineNumber: number;
    index: number;
    msg: string;
}

export const Editor: React.FC<{
    setStory: any;
}> = ({setStory}) => {

    const defaultPrompt = `LIST letters = a,b,c
    Once upon a time...
    -(opts)
    + Choice A.
    + Choice B.
    + Choice C.
   
   - They lived happily ever after {opts}.
       -> opts
   `

    const editor = useRef<HTMLDivElement>(null);
    const [parseErrors, setParseErrors] = useState<Issue[]>([])
    const [parsedStory, setParsedStory] = useState<ParsedStory>();

    const inkLinter = linter( (view: EditorView) => {
        return parseErrors.map(pe => {
            const line = view.lineBlockAt(pe.index)
            return {
                from: line.from,
                to: line.to,
                severity: pe.type.includes("ERROR") ? 'error'
                        : pe.type.includes("WARNING") ? 'warning'
                        : "info",
                message: pe.msg
            } as Diagnostic;
        })
    })

    const locate = (state: EditorState): string[]|null => {
        if(parsedStory === undefined) return ["Could not parse story"];
        
        const range = state.selection.ranges[0];
        let line = state.doc.lineAt(range.head)
        let lineIndex = line.number;
        let charInLineIndex = (range.head - line.from)

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

            const children = subHierarchy.content
            //TODO : add other children

            for(let c of children){
                const newAcc = [...accumulator].concat(subHierarchy)
                const found = _locate(c, newAcc)
                if(found === null) continue;

                if(found.length > 0 && eltIsEmpty(found[found.length-1])){
                    found.splice(-1, 1)
                }
                return found;
                
            }
            return [...accumulator].concat(subHierarchy);
        }

        const located  = _locate(parsedStory);
        console.log(located)
        return located?.map(e => e.GetType()) || []
    }

    function hierarchyPanel(view: EditorView): Panel {
        let dom = document.createElement("div")
        dom.textContent = "Story compiled successfully";
        return {
          dom,
          update(update) {
            if (update.selectionSet)
              dom.textContent = locate(view.state)?.join(" > ") || "Could not parse at position"
          }
        }
      }

      
    const { setContainer } = useCodeMirror({
        container: editor.current,
        extensions: [ inkLinter, 
                      lintGutter(),
                      showPanel.of(hierarchyPanel)
                    ],
        value: defaultPrompt,
        minHeight: "100%",
        height: "100%",
        theme: 'dark',
        onChange: (value, viewUpdate) => {
            compileOnChange(value)
        }
    });
    

    const compileOnChange = (ink: string) => {

        const errors: Issue[] = []
        const errorHandler = (message: string, type: number) =>{
            var issueRegex = /^(ERROR|WARNING|RUNTIME ERROR|RUNTIME WARNING|TODO): ('([^']+)' )?line (\d+): (.*)/;
            let issueMatches = message.match(issueRegex);

            if(issueMatches){
                const type = issueMatches[1] as Issue['type'];
                const filename = issueMatches[3];
                const lineNumber = parseInt(issueMatches[4]);
                const msg = issueMatches[5];
                
                //recompute index of characters
                const regex = /\n/gi, indices = [];
                let result = null;
                while ( (result = regex.exec(ink)) ) {
                    indices.push(result.index+1);
                }
                const index = indices[lineNumber - 1] || 0;
                errors.push({
                    type,
                    filename,
                    lineNumber,
                    index,
                    msg,
                })
            }
        }
        
        const options = new CompilerOptions(null,[],false,errorHandler,null)
        const compiler = new Compiler(ink, options)
        try{
            const story = compiler.Compile();
            const parsedStory = compiler.parsedStory;
            setParsedStory(parsedStory)
            setStory(story)
        }catch(e){
            setParsedStory(undefined);
            console.error(e)
        }finally{
            setParseErrors(errors)
        }
    }

    useEffect( () => {
        compileOnChange(defaultPrompt)
    },[])
    useEffect(() => {
        if (editor.current) {
          setContainer(editor.current);
        }
    }, [editor.current]);

    return (
        <div className="editor" ref={editor}></div>
    )

}