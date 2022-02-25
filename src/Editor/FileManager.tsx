export const FileManager = (props:{visible: boolean}) => {
    const {visible} = props;
    return (
        <div className={`split-view-view ${visible ? 'visible' : ''} left-bar`}
                style={{
                left: '48px', width: '120px', height: '100%'
                }}>
                <div className="monaco-action-bar vertical">
                <ul className="actions-container" role="toolbar" aria-label="Active View Switcher">
                    <li className="action-item icon" 
                        role="tab">
                        <a className="action-label codicon codicon-explorer-view-icon" 
                            style={{color: "rgb(248, 248, 242)"}}></a>
                        <div className="active-item-indicator"></div>
                    </li>
                    <li className="action-item icon checked" 
                        role="tab">
                        <a className="action-label codicon codicon-edit-icon" 
                            style={{color: "rgb(248, 248, 242)"}}></a>
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