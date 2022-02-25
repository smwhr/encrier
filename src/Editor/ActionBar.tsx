export const ActionBar = (props:{toggleFileManager: any}) => {
    const {toggleFileManager} = props;
    return (
        <div className="split-view-view visible left-bar"
                style={{
                left: '0px', width: '48px', height: '100%'
                }}>
                <div className="monaco-action-bar vertical">
                <ul className="actions-container" role="toolbar" aria-label="Active View Switcher">
                    <li className="action-item icon" 
                        role="tab">
                        <a className="action-label codicon codicon-explorer-view-icon" 
                            style={{color: "rgb(248, 248, 242)"}}
                            onClick={toggleFileManager}
                        ></a>
                        <div className="active-item-indicator"></div>
                    </li>
                    <li className="action-item icon checked" 
                        role="tab">
                        <a className="action-label codicon codicon-edit-icon" 
                            style={{color: "rgb(248, 248, 242)"}}
                        ></a>
                        <div className="active-item-indicator"></div>
                    </li>
                    <li className="action-item icon checked" 
                        role="tab">
                        <a className="action-label codicon codicon-play-icon" 
                            style={{color: "rgb(248, 248, 242)"}}></a>
                        <div className="active-item-indicator"></div>
                    </li>
                </ul>
                </div>
        
        </div>
    )

}