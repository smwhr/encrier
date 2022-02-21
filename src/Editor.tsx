import { useRef, useEffect, useState, useCallback } from 'react';
import { EditorView, useCodeMirror } from '@uiw/react-codemirror';
import {linter, lintGutter, Diagnostic, forceLinting} from "@codemirror/lint"
import { Compiler, CompilerOptions } from 'inkjs';

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

    const defaultPrompt = `Once upon a time...
    -(opts)
    + Choice A.
    + Choice B.
    + Choice C.
   
   - They lived happily ever after {opts}.
       -> opts
   `

    const editor = useRef<HTMLDivElement>(null);
    const [parseErrors, setParseErrors] = useState<Issue[]>([])

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

      
    const { setContainer } = useCodeMirror({
        container: editor.current,
        extensions: [ inkLinter, lintGutter()],
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
            setStory(story)
        }catch(e){
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
            <div ref={editor}></div>
    )

}