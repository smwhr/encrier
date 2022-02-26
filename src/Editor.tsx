import {useEffect, useState, useRef } from 'react';
import { Story as ParsedStory } from "inkjs/compiler/Parser/ParsedHierarchy/Story";

import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import { useCompiler } from './Editor/useCompiler';
import { Knot } from 'inkjs/compiler/Parser/ParsedHierarchy/Knot';
import { isKnot, languageSuggestions } from './Editor/ink-language';
import { ActionBar } from './Editor/ActionBar';
import { FileManager } from './Editor/FileManager';
import { Story } from 'inkjs/engine/Story';
import { saveAs } from './Editor/saveAs';
import { openFile } from './Editor/openFile';
import { JsonFileHandler } from './Editor/FileHandler';


export const Editor: React.FC<{
    className?: string;
    setStory: any;
    showFileManager: boolean;
}> = ({setStory, className, showFileManager}) => {

    const defaultPrompt = `LIST letters = a,b,c
    Once upon a time...
    -(opts)
    + Choice A.
    + Choice B.
    + Choice C.
        ->knot
   
   - They lived happily ever after {opts}.
       -> opts

== knot ==
Another castle
->END
   `

    const monaco = useMonaco();
    const editorRef = useRef<any>(null);

    const [ink, setInk] = useState<string>(defaultPrompt)
    const [innerStory, setInnerStory] = useState<Story>()
    const [parsedStory, setParsedStory] = useState<ParsedStory>()
    const [parseErrors, setParseErrors] = useState<Issue[]>()

    const [decorations, setDecorations] = useState([])

    const [fileHandler, setFileHandler] = useState(new JsonFileHandler({'inmemory://model/1': defaultPrompt}))

    /*
     * Decorate gutter and lines on error
     */
    useEffect(() => {
      if (monaco && editorRef.current && parseErrors) {
        const editor = editorRef.current;
        let newDecorations = parseErrors.map(e => {
          return {
            range: new monaco.Range(e.lineNumber, 1, e.lineNumber, 1),
            options: {
              isWholeLine: true,
              glyphMarginClassName: e.type.includes("ERROR") ? 'errorIcon' 
                                  : e.type.includes("WARNING") ? 'warningIcon' 
                                  : 'infoIcon',
              // linesDecorationsClassName: e.type.includes("ERROR") ? 'errorLineDecoration' 
              //                          : e.type.includes("WARNING") ? 'warningLineDecoration' 
              //                          : 'infoLineDecoration',
              glyphMarginHoverMessage: {value: e.msg}
            }
          }
        })
        setDecorations(editor.deltaDecorations(decorations, newDecorations))
      }
    }, [monaco, editorRef, parseErrors]);

    /*
     *    Fold the knots at the toplevel
     */
    useEffect(() => {
      if(monaco && parsedStory){
        const registeredProvider = monaco.languages.registerFoldingRangeProvider('ink', {
          provideFoldingRanges: function () {
            return parsedStory.content
                      .filter(c => c.debugMetadata !== null)
                      .map(c => ({
                            start: c.debugMetadata!.startLineNumber,
                            end: Math.max(c.debugMetadata!.startLineNumber, c.debugMetadata!.endLineNumber - 1),
                            kind: monaco.languages.FoldingRangeKind.Region
              }))
          }
        })
        return () => {
          registeredProvider.dispose()
        }
      }

    }, [monaco, parsedStory])

    /*
     *    Provide autocompletion
     */
    useEffect(() => {
      if(monaco && parsedStory){
        const registeredProvider = monaco.languages.registerCompletionItemProvider('ink', {
          provideCompletionItems: function () {
            const knotSuggestions = parsedStory.content
                      .filter(c => c.debugMetadata !== null)
                      .filter(isKnot)
                      .map( c => ({
                          label: c.name,
                          kind: monaco.languages.CompletionItemKind.Text,
                          insertText: `-> ${c.name}`
                      }))
            
            const languageSugg = languageSuggestions(monaco)


            return { suggestions: knotSuggestions.concat(languageSugg) }
          }
        })
        return () => {
          registeredProvider.dispose()
        }
      }

    }, [monaco, parsedStory])

    useEffect(() => {
        const {story, parsedStory, parseErrors}  = useCompiler(ink, {fileHandler})
        if(story){
          setStory(story);
          setInnerStory(story);
        }

        setParsedStory(parsedStory);
        setParseErrors(parseErrors);
    }, [ink, monaco, editorRef])

    const onChange = (value: string | undefined) => {
      if(value) setInk(value);
    }

    const openInk = (editor: any, monaco: any) => () => {
      openFile().then( ({filename, content}) => {
        console.log(content)
        var newmodel = monaco.editor.createModel(content, "ink", `inmemory://model/${filename}`);
        const model = editor.getModel();
        model.dispose()
        editor.setModel(newmodel)
        fileHandler.delete(`${model.uri}`)
                   .update(`${newmodel.uri}`, ink)
        setInk(content as string)
        setFileHandler(fileHandler);
      })
    }

    const exportJson = () => {
      if(innerStory){
        const blob = new Blob([innerStory.ToJson() as string], { type: "application/json" });
        saveAs(blob, "main.ink.json");
      }else{
        alert("There are errors to fix first.")
      }
    }

    const exportInk = () => {
      if(ink){
        const blob = new Blob([ink as string], { type: "text/plain" });
        saveAs(blob, "main.ink");
      }else{
        alert("File is empty")
      }
    }

    useEffect(() => {
      if(!editorRef.current) return;
      if(!monaco) return;
      const editor = editorRef.current;

      const save_json_action = editor.addAction({
        id: "save_json",
        label: "Save as JSON",
        keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_S,
        ],
        run: exportJson
      })

      const save_story_action = editor.addAction({
        id: "save_story",
        label: "Save story",
        keybindings: [
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
        ],
        run: exportInk
      })

      const open_story_action = editor.addAction({
        id: "open_story",
        label: "Open story (ink)",
        keybindings: [
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_O,
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_O,
        ],
        run: openInk(editor, monaco)
      })
      
      return () => {
        save_json_action.dispose()
        save_story_action.dispose()
        open_story_action.dispose()
      }
    }, [editorRef, innerStory, ink])

    const handleEditorDidMount = (editor: any, monaco: any) => {
      editorRef.current = editor; 
      monaco.languages.register({
        id: 'ink'
      });

    }
    
    return (
      <div className={`editor-wrapper ${className} ${showFileManager ? 'with-filemanager' : ''}`}>
            <FileManager visible={showFileManager} fileHandler={fileHandler}/>

            <MonacoEditor
              className="editor"
              theme="vs-dark"
              height="100%"
              width="100%"
              defaultValue={ink}
              language="ink"
              onChange={onChange}
              onMount={handleEditorDidMount}
              options={{
                glyphMargin: true,
                lineDecorationsWidth: 2,
                lineNumbers: 'off'
              }}
              
            />
      </div>
    )

}