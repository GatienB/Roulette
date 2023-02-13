import React from "react";

type PaginationState = {
    indexMax: number,
    index: number,
    onIndexChanged: Function
}

export class Pagination extends React.Component<PaginationState> {

    // componentDidUpdate(prevProps: Readonly<HistoryState>, prevState: Readonly<{ historyIndex: number; }>, snapshot?: any): void {
    //     console.log(prevProps)
    //     console.log(this.props)
    //     if (prevProps.history.length !== this.props.history.length) {
    //         this.setState({ historyIndex: -1 });
    //     }
    // }

    onIndexChanged(sens: string) {
        this.props.onIndexChanged(sens);
        // let nextIndex: number = -1;
        // if (sens === "-") {
        //     if (this.props.historyIndex - 1 >= 0)
        //         nextIndex = this.props.historyIndex - 1;
        //     else
        //         nextIndex = 0;
        // } else if (sens === "+") {
        //     if (this.props.historyIndex + 1 < this.props.history.length)
        //         nextIndex = this.props.historyIndex + 1;
        //     else
        //         nextIndex = this.props.history.length - 1;
        // }

        // this.setState({ historyIndex: nextIndex }, () => {
        //     this.props.onHistoryIndexChanged(this.props.historyIndex);
        // })
    }

    render(): React.ReactNode {
        return (
            <div>
                {/*this.props.index > 0 &&*/
                    <button id="playLastBetsBtn" onClick={() => this.onIndexChanged("-")}>&lt;</button>}
                <span id="bet-index">{this.props.index !== -1 ? this.props.index + 1 : '-'}/{this.props.indexMax}</span>
                {/*this.props.index < this.props.indexMax - 1 &&*/
                    <button id="playNextBetsBtn" onClick={() => this.onIndexChanged("+")}>&gt;</button>}
            </div>
        )
    }
}