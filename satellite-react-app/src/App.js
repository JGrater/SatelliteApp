import React from "react";
import "./assets/theme.css";
import { Engine } from "./engine";
import SelectedStation from "./Search/SelectedStation";
import Info from "./Info";


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
        this.engine.initialise(this.el, {
            onStationClicked: this.handleStationClicked
        });
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
        this.state.selected.forEach(s => this.engine.removeOrbit(s));

        const newType = this.state.referenceFrame === 1 ? 2 : 1;
        this.setState({referenceFrame: newType});
        this.engine.setReferenceFrame(newType);
    }

    handleRemoveSelected = () => {        
        this.deselectStation();
    }

    handleRemoveAllSelected = () => {
        this.state.selected.forEach(s => this.engine.removeOrbit(s));
        this.setState({selected: []});
    }

    handleStationClicked = (station) => {
        if (!station) return;

        this.toggleSelection(station);
    }

    toggleSelection(station) {
        this.deselectStation();
        if (!this.isSelected(station)) {
            this.selectStation(station);
        }
    }

    isSelected = (station) => {
        return this.state.selected.includes(station);
    }

    selectStation = (station) => {
        const newSelected = this.state.selected.concat(station);
        this.setState({selected: newSelected});

        this.engine.addOrbit(station);
    }

    deselectStation = () => {
        this.state.selected.forEach(s => this.engine.removeOrbit(s));
        while(this.state.selected.length > 0) {
            this.state.selected.pop();
        }
    }

    addSatellites() {
        /*var ISS = { 
            name: "ISS",
            tleLine1: '1 25544U 98067A   24101.03904484  .00012558  00000-0  22725-3 0  9992',
            tleLine2:'2 25544  51.6391 293.2963 0004827  53.6203  54.5347 15.50046419447975'
        }
        this.state.stations.push(ISS)
        this.engine.addSatellite(ISS, 0xFFFFFF, 50);*/

        this.fetchSatellites('https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle')
            .then(stations => {
                this.setState({stations});
            })
    }

    fetchSatellites(url) {
        return fetch(url).then(res => {
            if (res.ok) {
                return res.text().then(text => {
                    const stations = this.parseTleFile(text)
                    stations.forEach(s => {
                        this.engine.addSatellite(s, 0xFFFFFF, 45)
                    })
                    this.engine.render();
                    return stations;
                })
            }
        })
    }

    parseTleFile(tleFile) {
        const result = [];
        const lines = tleFile.split("\n");
        let current = null;

        for (let i = 0; i < lines.length; ++i) {
            const line = lines[i].trim();

            if (line.length === 0) continue;

            if (line[0] === '1') {
                current.tleLine1 = line;
            }
            else if (line[0] === '2') {
                current.tleLine2 = line;
            }
            else {
                current = { 
                    name: line, 
                };
                result.push(current);
            }
        }

        return result;
    }

    render() {
        const { selected, stations, initialDate, currentDate } = this.state;

        return (
            <div>
                <Info stations={stations} />
                <SelectedStation selected={selected} onRemoveStation={this.handleRemoveSelected} onStationClick={this.handleRemoveAllSelected}/>
                <div ref={c => this.el = c} style={{ width: '99%', height: '99%' }} />
            </div>
        )
    }
}

export default App;
