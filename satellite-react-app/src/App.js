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
        this.engine.updateEarthRotation(new Date());
        this.addSatellites();
    }

    componentWillUnmount() {
        this.engine.dispose();
    }

    addSatellites() {
        var ISS = { 
            tleLine1: '1 25544U 98067A   19156.50900463  .00003075  00000-0  59442-4 0  9992',
            tleLine2: '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442',
         }
        this.engine.addSatellite(ISS, 0xffffff, 10);
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
