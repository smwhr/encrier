import { Knot } from "inkjs/compiler/Parser/ParsedHierarchy/Knot"
import { ParsedObject } from "inkjs/compiler/Parser/ParsedHierarchy/Object"

export const isKnot = (c: ParsedObject): c is Knot => c.GetType() == 'Knot';


export const languageSuggestions = (monaco: any) => [
    {
        label: 'choice',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: '* ${1:text}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'Simple choice'
    },
    {
        label: 'labeled-choice',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: '*(${2:label}) ${1:text}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'Labeled choice'
    }
]