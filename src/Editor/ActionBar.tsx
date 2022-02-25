export const ActionBar = ({toggleFileManager, playerActive, setPlayerActive, editorActive, setEditorActive}:{
    toggleFileManager: any
    playerActive: boolean;
    setPlayerActive: any
    editorActive: boolean;
    setEditorActive: any
}) => {

    const showPlayer = () => {
        setPlayerActive(true);
        setEditorActive(false);
    }

    const showEditor = () => {
        setPlayerActive(false);
        setEditorActive(true);
    }
    
    return (
        <div className="left-bar">
            <div className="monaco-action-bar vertical">
                <ul className="actions-container" role="toolbar" aria-label="Active View Switcher">
                    <li className="action-item icon checked mobile-show" 
                        role="tab">
                        <a className="action-label codicon codicon-edit-icon" 
                            style={{color: "rgb(248, 248, 242)"}}
                            onClick={showEditor}
                        ></a>
                        <div className="active-item-indicator"></div>
                    </li>
                    {editorActive&& <li className="action-item icon" 
                        role="tab">
                        <a className="action-label codicon codicon-explorer-view-icon" 
                            style={{color: "rgb(248, 248, 242)"}}
                            onClick={toggleFileManager}
                        ></a>
                        <div className="active-item-indicator"></div>
                    </li>}
                    <li className="action-item icon checked mobile-show" 
                        role="tab">
                        <a className="action-label codicon codicon-play-icon" 
                            style={{color: "rgb(248, 248, 242)"}}
                            onClick={showPlayer}
                        ></a>
                        <div className="active-item-indicator"></div>
                    </li>
                </ul>
            </div>
        </div>
    )

}