import { Story } from "inkjs/engine/Story"
import { useEffect, useRef, useReducer, useState, useLayoutEffect } from "react";

interface Choice{
    text: string;
    index: number;
}
interface StoryState {
    texts: string[];
    choices: Choice[];
}
type ResetAction = { type: "reset";}
type AddTextAction = { type: "add_text"; payload: string;}
type AddChoiceAction = { type: "add_choice"; payload: Choice;}
type ClearChoicesAction = { type: "clear_choices";}
type StoryAction = ResetAction | AddTextAction | AddChoiceAction | ClearChoicesAction;

const intialStoryState: StoryState = {texts: [], choices: []}

function reducer(state: StoryState, action: StoryAction): StoryState {
    switch (action.type) {
      case 'reset':
          return intialStoryState;
      case 'add_text':
        return {... state, texts : state.texts.concat(action.payload)};
      case 'add_choice':
        return {... state, choices : state.choices.concat(action.payload)};
      case 'clear_choices':
        return {... state, choices: []};
      default:
        throw new Error();
    }
  }

export const Player: React.FC<{
    story: Story | null;
}> = ({story}) => {

    const [storyState, dispatch] = useReducer(reducer, intialStoryState)
    const [choiceHistory, setChoiceHistory] = useState<number[]>([])

    const container = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if(story === null) return;
        continueStory(story, dispatch)

        return () => {
            dispatch({type: "reset"})
        }
    }, [story])

    useLayoutEffect(() => {
        if(story === null) return;
        for(let ci of choiceHistory){
            try{
                story.ChooseChoiceIndex(ci);
            }catch(e){
                break;
            }
        }
    }, [story])

    if(story === null) return null;

    const {texts, choices} = storyState;

    const choiceOnChose = (index: number) => () => {
        dispatch({type: "clear_choices"});
        setChoiceHistory(choiceHistory.concat(index))
        story.ChooseChoiceIndex(index);
        continueStory(story, dispatch);
    }

    return (
        <div>
            <div className="container" ref={container}>
            {texts.map( (t, i) => (
                <p key={i}>{t}</p>
            ))}
            {choices.length > 0 && (
                choices.map(c => (
                    <p className="choice" key={`choice-${c.index}`}>
                        <a href="#" onClick={choiceOnChose(c.index)}>{c.index}. {c.text}</a>
                    </p>
                ))
            )}
            </div>
        </div>
    )

}

function continueStory(story: Story, dispatch: React.Dispatch<StoryAction>){
        while(story.canContinue) {
            var text = story.Continue() as string;
            var tags = story.currentTags;
            dispatch({type: "add_text", payload: text})
            // if(tags && tags.length > 0){
            //     await print(container, tags.map(t => `#${t}`).join(" "), ["tags"])
            // }
        }
        story.currentChoices.forEach(function(choice, index) {
            dispatch({type: "add_choice", payload:{
                "text": choice.text,
                "index": choice.index
            }})
        });
    }