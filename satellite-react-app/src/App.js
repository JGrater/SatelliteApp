import React from "react";
import { Engine } from "./engine";


class App extends React.Component{
    
    state = {
        selected: [],
        stations: [], 
        initialDate: new Date().getTime(),
        currentDate: new Date().getTime(),
        referenceFrame: 1
    }

    componentDidMount() {
        this.engine = new Engine();
        this.engine.referenceFrame = this.state.referenceFrame;
        this.engine.initialise(this.el);
        this.addSatellites();
        
        this.engine.updateScene(new Date());

        setInterval(this.handleTimer, 1000);
    }

    componentWillUnmount() {
        this.engine.dispose();
    }

    handleTimer = () => {
        // By default, update in realtime every second, unless dateSlider is displayed.
        this.handleDateChange(null, new Date());
    }

    handleDateChange = (v, d) => {
        const newDate = v ? v.target.value : d;
        this.setState({ currentDate: newDate });

        const date = new Date();
        date.setTime(newDate);
        this.engine.updateScene(date);
    }

    handleReferenceFrameChange = () => {
        const newType = this.state.referenceFrame === 1 ? 2 : 1;
        this.setState({referenceFrame: newType});
        this.engine.setReferenceFrame(newType);
    }

    addSatellites() {
        var ISS = { 
            tleLine1: '1 25544U 98067A   19156.50900463  .00003075  00000-0  59442-4 0  9992',
            tleLine2: '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442',
         }
        this.engine.addSatellite(ISS, 0xFF0000, 20);
    }

    render() {
        const { selected, stations, initialDate, currentDate } = this.state;

        return (
            <div>
                <div ref={c => this.el = c} style={{ width: '99%', height: '99%' }} />
            </div>
        )
    }
}

export default App;
