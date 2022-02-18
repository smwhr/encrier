import { Story } from "inkjs/engine/Story"
import { useEffect, useRef } from "react";


export const Player: React.FC<{
    story: Story | null;
}> = ({story}) => {

    

    const container = useRef<HTMLDivElement>(null)

    

    useEffect(() => {
        if(story === null || container.current === null) return;
        (async () => {
            await continueStory(story, container.current!)
        })()

        return () => {
            if(container.current){
                container.current.innerHTML = ""
            }
        }
    }, [story])

    if(story === null) return null;

    return (
        <div>
            <div className="container" ref={container}>
            </div>
        </div>
    )

}



async function scroll(container: HTMLElement){
    var start = container.scrollTop;
    var target = container.scrollHeight - container.clientHeight;

    var dist = Math.max(0, target - start);
    var duration = 300*dist/100;
    var startTime: number|null = null;

    let resolve: ((value?:unknown) => void) | null = null;
    var promise = new Promise(r => {
        resolve = r;
    }) 
    // debugger;
    function step(time: number) {
        if( startTime == null ) startTime = time;
        var t = (time-startTime) / duration;
        var lerp = 3*t*t - 2*t*t*t; // ease in/out
        container.scrollTo(0, (1.0-lerp)*start + lerp*target);
        if( t < 1 ){
            requestAnimationFrame(step);
        }else{
            resolve && resolve();
        }
    }
    requestAnimationFrame(step);
    return promise;
}

async function wait(t: number){
    return new Promise<void>(resolve => {
        setTimeout(() => {  resolve(); 
        }, t);
    });
}

async function print(container: HTMLElement, message: string, classNames: string[] = [] , immediately: boolean = false){
    var p = document.createElement('p');
        p.classList.add(...classNames)
        p.classList.add('invisible');
        p.innerHTML = message;
    container.appendChild(p);

    return new Promise<void>(resolve => {
        setTimeout(() => { 
            p.classList.remove('invisible');
            resolve(); 
        }, immediately ? 0 : 300);
    });
}

function removeAll(container: HTMLElement, selector: string)
    {
        var allElements = container.querySelectorAll(selector);
        for(var i=0; i<allElements.length; i++) {
            var el = allElements[i];
            el.parentNode?.removeChild(el);
        }
    }

async function continueStory(story: Story, container: HTMLElement){
        while(story.canContinue) {
            var text = story.Continue() as string;
            var tags = story.currentTags;
            await print(container, text)
            if(tags && tags.length > 0){
                await print(container, tags.map(t => `#${t}`).join(" "), ["tags"])
            }
        }
        story.currentChoices.forEach(async function(choice, index) {

            // Create paragraph with anchor element
            var choiceElement = document.createElement('p');
            choiceElement.classList.add("choice", "invisible");
            choiceElement.innerHTML = `<a href='#'>${choice.text}</a>`
            container.appendChild(choiceElement);
            await scroll(container);
            await wait(200 * index)
            choiceElement.classList.remove("invisible")

            // Click on choice
            var choiceAnchorEl = choiceElement.querySelectorAll("a")[0];
            choiceAnchorEl.addEventListener("click", function(event) {
                event.preventDefault();

                removeAll(container, ".choice")
                story.ChooseChoiceIndex(choice.index);
                continueStory(story, container);
            });
        });
    }