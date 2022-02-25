import { useState } from 'react';
import { Compiler, CompilerOptions } from 'inkjs/compiler/Compiler';
import { Story } from "inkjs/engine/Story";
import { Story as ParsedStory } from "inkjs/compiler/Parser/ParsedHierarchy/Story";
import { IFileHandler } from 'inkjs/compiler/IFileHandler';
import { FileHandlerError } from './FileHandler';


export const useCompiler = (ink: string, options:{
    fileHandler?:IFileHandler
}):{
    story: Story|undefined; 
    parsedStory: ParsedStory|undefined;
    parseErrors: Issue[];
} => {

    const parseErrors:Issue[] = [];

    const errorHandler = (message: string, type: number) =>{
        var issueRegex = /^(ERROR|WARNING|RUNTIME ERROR|RUNTIME WARNING|TODO): ('([^']+)' )?line (\d+): (.*)/;
        let issueMatches = message.match(issueRegex);

        if(issueMatches){
            const type = issueMatches[1] as Issue['type'];
            const filename = issueMatches[3];
            const lineNumber = parseInt(issueMatches[4]);
            const msg = issueMatches[5];

            //recompute index of characters
            const regex = /\n/gi, indices = [0];
            let result = null;
            while ( (result = regex.exec(ink)) ) {
                indices.push(result.index+1);
            }
            const index = indices[lineNumber - 1] || 0;
            
            const issue = {
                type,
                filename,
                lineNumber,
                index,
                msg,
            } as Issue
            parseErrors.push(issue)
        }
    }


    const compilerOptions = new CompilerOptions(null,[],false, errorHandler, options.fileHandler)
    const compiler = new Compiler(ink, compilerOptions)
    try{
        const story = compiler.Compile();
        const parsedStory = compiler.parsedStory;
        return {story, parsedStory, parseErrors}
    }catch(e){
        if(e instanceof FileHandlerError){
            errorHandler(e.message, 2)
        }
        return {story: undefined, parsedStory: undefined, parseErrors}
    }
}

