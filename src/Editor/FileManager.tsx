import { useEffect } from "react";
import { JsonFileHandler } from "./FileHandler";

export const FileManager = (props:{
    visible: boolean, 
    fileHandler: JsonFileHandler,
    active: string,
    setActiveFile: any
}) => {
    const {visible, fileHandler, active, setActiveFile} = props;

    const files = Object.keys(fileHandler.fileHierarchy)

    useEffect(() => {
        console.log("rerender file list")
        return;
    }, [files, active])

    

    return (
        <div className={`split-view-view ${visible ? 'visible' : ''} files-bar`}
                style={{
                left: '48px', width: '120px', height: '100%'
                }}>
                <div className="monaco-list">
                    <div className="monaco-scrollable-element">
                        <div className="monaco-list-rows">
                        {files.map(f => (
                        <div className={`monaco-list-row ${f === active ? 'highlight' : ''}`}
                             key={f}
                            >
                            <div className="monaco-tl-row">
                                <div className="monaco-tl-contents">
                                    <div className="monaco-icon-label">
                                        <div className="monaco-icon-label-container">
                                            <span className="monaco-icon-name-container">
                                                <a className="label-name ${}"
                                                   onClick={setActiveFile(f)}
                                                >
                                                    <span>{f.replace("file:///", "")}</span>
                                                </a>
                                            </span>
                                            <span className="monaco-icon-description-container"></span>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                        ))}
                        </div>
                    </div>
                </div>
        
        </div>
    )

}