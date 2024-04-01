import React from "react";
import { Engine } from "./engine";


class App extends React.Component{
    
    state = {
        selected: [],
        stations: [], 
        initialDate: new Date().getTime(),
        currentDate: new Date().getTime(), 
    }

    componentDidMount() {
        this.engine = new Engine();
        this.engine.initialise(this.el);
        this.engine.updateEarthRotation(new Date())
    }

    componentWillUnmount() {
        this.engine.dispose();
    }

    render() {
        const { selected, stations, initialDate, currentDate } = this.state;

        return (
            <div>
                <div ref={c => (this.el = c)} style={{ width: '99%', height: '99%' }} />
            </div>
        )
    }
}

export default App;
