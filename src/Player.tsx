import { Story } from "inkjs/engine/Story"
import { useRef, useReducer, useState, useLayoutEffect, MouseEvent } from "react";

interface Choice{text: string;index: number;delay: number;}
const Choice = (text: string, index: number): Choice => ({text, index, delay: 0})
interface StoryState {
    texts: Text[];
    choices: Choice[];
}

type Text = {text: string;classList: string[];delay: number;}
const Text = (text: string, classList:string[] = []): Text => ({text, classList, delay:0})

type ResetAction = { type: "reset";}
type AddTextAction = { type: "add_text"; payload: Text;}
type DelayTextAction = { type: "delay_text"; payload: {index: number; delay: number};}
type AddChoiceAction = { type: "add_choice"; payload: Choice;}
type DelayChoiceAction = { type: "delay_choice"; payload: {index: number; delay: number};}
type ClearChoicesAction = { type: "clear_choices";}
type StoryAction = ResetAction 
                 | AddTextAction 
                 | DelayTextAction 
                 | AddChoiceAction 
                 | DelayChoiceAction
                 | ClearChoicesAction;

const intialStoryState: StoryState = {texts: [], choices: []}

function reducer(state: StoryState, action: StoryAction): StoryState {
    switch (action.type) {
      case 'reset':
          return intialStoryState;
      case 'add_text':
        return {... state, texts : state.texts.concat(action.payload)};
      case 'delay_text':
          const {index: textIndex, delay: textDelay} = action.payload;
          const currentTexts =  state.texts;
                currentTexts[textIndex].delay = textDelay
            return {... state, texts : currentTexts};
      case 'add_choice':
        return {... state, choices : state.choices.concat(action.payload)};
        case 'delay_choice':
            const {index: choiceIndex, delay: choiceDelay} = action.payload;
            const currentChoices =  state.choices;
                    currentChoices[choiceIndex].delay = choiceDelay
              return {... state, choices : currentChoices};
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
    const storyStateRef = useRef(storyState.texts);

    const container = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        if(story === null) return;
        for(let ci of choiceHistory){
            try{
                continueStory(story, dispatch, ci)
            }catch(e){
                console.log(`Could not choose ${ci}`)
                setChoiceHistory(choiceHistory.slice(
                    0,
                    choiceHistory.indexOf(ci)
                ))
                break;
            }
        }
        continueStory(story, dispatch);
        return () => {
            dispatch({type: "reset"})
        }
    }, [story])

    useLayoutEffect(() => {
        if(container.current === null) return;

        const prev = storyStateRef.current;
        const current = storyState.texts;

        let i = 0;
        for(let t of current){ 
            const prevPosition = prev.indexOf(t);
            if(prevPosition === -1){
                const index = current.indexOf(t);
                const delay = i*200;
                dispatch({type: "delay_text", payload: {index, delay}})
                i++;
            }
        }
        
        for(let c of choices){ 
            if(c.delay > 0) continue;
            const index = choices.indexOf(c);
            const delay = i*200;
            dispatch({type: "delay_choice", payload: {index, delay}})
            i++;
        }
        
        storyStateRef.current = current;

        const lastEl = container.current.querySelector("p:last-child");
        if(lastEl){
            lastEl.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
        }

    }, [story, storyState.texts, storyState.choices])

    if(story === null) return null;

    const {texts, choices} = storyState;

    const choiceOnChoose = (index: number) => (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        dispatch({type: "clear_choices"});
        setChoiceHistory(choiceHistory.concat(index))
        story.ChooseChoiceIndex(index);
        continueStory(story, dispatch);
    }

    return (
        <div className="container" ref={container}>
            {texts.map( (t, i) => (
                <p key={i}
                    style={{
                        animationDelay: t.delay + 200 + 'ms'
                    }}
                >{t.text}</p>
            ))}
            {choices.length > 0 && (
                choices.map(c => (
                    <p 
                      key={`choice-${choiceHistory.length}-${c.index}`}
                      className="choice" 
                      style={{
                            animationDelay: c.delay + 200 + 'ms'
                        }}
                        >
                        <a href="#" onClick={choiceOnChoose(c.index)}>{c.text}</a>
                    </p>
                ))
            )}
            <p></p>
        
        </div>
    )

}

function continueStory(story: Story, dispatch: React.Dispatch<StoryAction>, immediatelyChose?:number){
        while(story.canContinue) {
            var text = story.Continue() as string;
            var tags = story.currentTags;
            dispatch({type: "add_text", payload: Text(text)})
            if(tags && tags.length > 0){
                dispatch({type: "add_text", payload: Text(
                        tags.map(t => `#${t}`).join(" "),
                        ["tags"]
                )})
            }
        }

        if(immediatelyChose !== undefined){
            story.ChooseChoiceIndex(immediatelyChose);
            return;
        }
        story.currentChoices.forEach(function(choice, index) {
            dispatch({type: "add_choice", 
                      payload: Choice(choice.text, choice.index)
                    })
        });
    }