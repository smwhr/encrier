import { Story } from "inkjs/engine/Story"
import { useRef, useReducer, useState, useLayoutEffect, useEffect, MouseEvent } from "react";

interface Choice{text: string;index: number;delay: number|null;}
const Choice = (text: string, index: number): Choice => ({text, index, delay: null})

interface Text{text: string;classList: string[];delay: number|null;}
const Text = (text: string, classList:string[] = []): Text => ({text, classList, delay: null})

function Delayed<T=Choice|Text>(item: T, delay: number|null): T{
    return {...item, delay}
}



type ResetAction = { type: "reset";}
type AddTextAction = { type: "add_text"; payload: Text;}
type DelayTextAction = { type: "delay_text"; payload: {index: number};}
type AddChoiceAction = { type: "add_choice"; payload: Choice;}
type DelayChoiceAction = { type: "delay_choice"; payload: {index: number};}
type ClearChoicesAction = { type: "clear_choices";}
type StoryAction = ResetAction 
                 | AddTextAction 
                 | DelayTextAction 
                 | AddChoiceAction 
                 | DelayChoiceAction
                 | ClearChoicesAction;

interface StoryState { texts: Text[]; choices: Choice[]; delayIndex: number}
const intialStoryState: StoryState = {texts: [], choices: [], delayIndex: 1}

function reducer(state: StoryState, action: StoryAction): StoryState {
    switch (action.type) {
      case 'reset':
          return intialStoryState;
      case 'add_text':
        return {... state, texts : state.texts.concat(action.payload)};
      case 'delay_text':
          const {index: textIndex} = action.payload;
          
          const currentTexts =  state.texts;
          const textAtIndex = currentTexts[textIndex]
          const delayOfText = textAtIndex.delay === null ? state.delayIndex : textAtIndex.delay;
                currentTexts[textIndex].delay = delayOfText;
          if(delayOfText === 0){
            currentTexts[textIndex].classList.push("no-animation")
          }
          return {... state, 
                  texts : currentTexts,
                  delayIndex: delayOfText === 0 ? 1 : state.delayIndex+1
                };
      case 'add_choice':
        return {... state, choices : state.choices.concat(action.payload)};
        case 'delay_choice':
            const {index: choiceIndex} = action.payload;
            const currentChoices =  state.choices;
            const choiceAtIndex = currentChoices[choiceIndex];
            const delayOfChoice = choiceAtIndex.delay === null ? state.delayIndex : choiceAtIndex.delay;
                  currentChoices[choiceIndex].delay = delayOfChoice;
            return {... state, 
                    choices : currentChoices,
                    delayIndex: state.delayIndex+1
                  };
      case 'clear_choices':
        return {... state, choices: []};
      default:
        throw new Error();
    }
  }

export const Player: React.FC<{
    story: Story | null;
    className?: string;
}> = ({story, className}) => {

    const [playedStory, setPlayedStory] = useState<Story|null>(story);
    const [storyState, dispatch] = useReducer(reducer, intialStoryState)
    const [choiceHistory, setChoiceHistory] = useState<number[]>([])
    const storyStateRef = useRef(storyState.texts);

    const container = useRef<HTMLDivElement>(null)

    const rewindHistory = () => {
        if(playedStory === null) return;
        const newHistory = choiceHistory.slice(0, -1);
        playedStory.ResetState()
        setChoiceHistory(newHistory)
        setPlayedStory(null);
        setTimeout(() =>{
            setPlayedStory(playedStory);
        }, 0)
        
    }

    useEffect(() => {
            setPlayedStory(story)
    }, [story])

    useLayoutEffect(() => {
        if(playedStory === null) return;
        for(let ci of choiceHistory){
            try{
                continueStory(playedStory, dispatch, ci)
            }catch(e){
                console.log(`Could not choose ${ci}`)
                setChoiceHistory(choiceHistory.slice(
                    0,
                    choiceHistory.indexOf(ci)
                ))
                break;
            }
        }
        continueStory(playedStory, dispatch, null);
        return () => {
            dispatch({type: "reset"})
        }
    }, [playedStory])


    /*
     *      Delayed text opacity effect
     */
    useLayoutEffect(() => {
        if(container.current === null) return;

        const prev = storyStateRef.current;
        const current = storyState.texts;

        let i = 1;
        for(let t of current){ 
            const prevPosition = prev.indexOf(t);
            if(prevPosition === -1){
                const index = current.indexOf(t);
                dispatch({type: "delay_text", payload: {index}})
                i++;
            }
        }
        
        for(let c of choices){ 
            if(c.delay !== null) continue;
            const index = choices.indexOf(c);
            dispatch({type: "delay_choice", payload: {index}})
            i++;
        }
        
        storyStateRef.current = current;

        const lastEl = container.current.querySelector("p:last-child");
        if(lastEl){
            lastEl.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
        }

    }, [playedStory, storyState.texts, storyState.choices])

    if(playedStory === null) return null;

    const {texts, choices} = storyState;

    const choiceOnChoose = (index: number) => (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        dispatch({type: "clear_choices"});
        const newHistory = [...choiceHistory, index]
        setChoiceHistory(newHistory)
        playedStory.ChooseChoiceIndex(index);
        continueStory(playedStory, dispatch);
    }

    return (
        <div className="player-wrapper">
            <div className="toolbar ">
                <div className="actions-container">
                    <div className="action-item icon">
                        <a className="action-label codicon codicon-debug-step-back" 
                                style={{color: "rgb(248, 248, 242)"}}
                                onClick={rewindHistory}
                        ></a>
                    </div>
                </div>
                
            </div>
            <div className={`container ${className}`} ref={container}>
                {texts.map( (t, i) => (
                    <p key={i}
                        className={t.classList.join(" ")}
                        style={{
                            animationDelay: t.delay + 'ms'
                        }}
                    >{t.text}</p>
                ))}
                {choices.length > 0 && (
                    choices.map(c => (
                        <p 
                        key={`choice-${choiceHistory.length}-${c.index}`}
                        className="choice" 
                        style={{
                                animationDelay: c.delay + 'ms'
                            }}
                            >
                            <a href="#" onClick={choiceOnChoose(c.index)}>{c.text}</a>
                        </p>
                    ))
                )}
                <p></p>
            
            </div>
        </div>
    )

}

function continueStory(story: Story, dispatch: React.Dispatch<StoryAction>, immediatelyChose?:number|null){
        const presetDelay = immediatelyChose !== undefined ? 0 : null
        while(story.canContinue) {
            var text = story.Continue() as string;
            var tags = story.currentTags;
            dispatch({type: "add_text", payload: Delayed(Text(text), presetDelay)})
            if(tags && tags.length > 0){
                dispatch({type: "add_text", payload: Delayed(Text(
                        tags.map(t => `#${t}`).join(" "),
                        ["tags"]
                ), presetDelay)})
            }
        }

        if(immediatelyChose !== undefined && immediatelyChose !== null){
            story.ChooseChoiceIndex(immediatelyChose);
            return;
        }
        story.currentChoices.forEach(function(choice, index) {
            dispatch({type: "add_choice", 
                      payload: Choice(choice.text, choice.index)
                    })
        });
    }