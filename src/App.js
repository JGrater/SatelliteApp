import React from "react";
import "./assets/theme.css";
import { Engine } from "./engine";
import Search from "./Search/Search";
import SelectedStation from "./Search/SelectedStation";
import Info from "./Info";
import SelectedGroups from "./Search/SelectedGroups";
    
class App extends React.Component{

    state = {
        selected: [],
        stations: [], 
        initialDate: new Date().getTime(),
        currentDate: new Date().getTime(),
        referenceFrame: 1
    }

    groups = {
        active: {
            title: 'active',
            url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle',
            cache: {
                data: null,
                timestamp: null
            }
        },
        geostationary: {
            title: 'geostationary',
            url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=geo&FORMAT=tle',
            cache: {
                data: null,
                timestamp: null
            }
        },
        starlink: {
            title: 'starlink',
            url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle',
            cache: {
                data: null,
                timestamp: null
            }
        },
        debris: {
            title: 'debris',
            url: 'https://www.space-track.org/basicspacedata/query/class/gp/OBJECT_TYPE/%3C%3EPayload/DECAY_DATE/null-val/orderby/DECAY_DATE%20asc/format/3le/emptyresult/show',
            cache: {
                data: null,
                timestamp: null
            }
        }
    }

    componentDidMount() {
        this.engine = new Engine();
        this.engine.referenceFrame = this.state.referenceFrame;
        this.engine.initialise(this.el, {
            onStationClicked: this.handleStationClicked
        });
        this.fetchSatellites(this.groups.active);
        
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

    handleSearchResultClick = (station) => {
        if (!station) return;

        this.toggleSelection(station);
    }

    handleGroupClick = (group) => {
        if (!group) return;
        this.selectGroup(group);
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

    selectGroup = (selectedGroup) => {
        this.removeSatellites();
        switch(selectedGroup) {
            case "active":
                this.fetchSatellites(this.groups.active);
                break;
            case "starlink":
                this.fetchSatellites(this.groups.starlink);
                break;
            case "geostationary":
                this.fetchSatellites(this.groups.geostationary);
                break;
            case "debris":
                this.fetchDebris(this.groups.debris.url);
                break;
        }
    }

    removeSatellites() {
        console.log("Removing sats")
        this.deselectStation()
        this.engine.removeAllSatellites();
        this.setState({stations: []})
    }

    fetchDebris = async (url) => {
        if (this.groups.debris.cache.data && this.groups.debris.cache.timestamp) {
            console.log('fetching from cache')
            const stations = this.parseTleFile(this.groups.debris.cache.data)
            this.addSatellites(stations);
            return;
        }
 
        try {
            console.log('fetching from space-track-api')
            const res = await fetch('http://localhost:3001/fetch-debris', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });
 
            if (res.ok) {
                const satelliteData = await res.json();
                this.groups.debris.cache = {
                    data: satelliteData,
                    timestamp: new Date()
                };
                const stations = this.parseTleFile(satelliteData);
                console.log(stations);
                this.addSatellites(stations);
            } else {
                console.error('Failed to fetch satellite data');
            }
        } catch(error) {
            console.error('Error fetching satellite data:', error);
        }
    }

    fetchSatellites(group) {
        if (group.cache.data && group.cache.timestamp) {
            console.log('fetching from cache')
            const stations = this.parseTleFile(group.cache.data)
            this.addSatellites(stations);
            return;
        }

        fetch(group.url).then(res => {
            console.log('fetching from celestrak')
            if (res.ok) {
                return res.text().then(text => {
                    group.cache = {
                        data: text,
                        timestamp: new Date()
                    };
                    const stations = this.parseTleFile(text);
                    this.addSatellites(stations);
                })
            }
        })
    }

    addSatellites(stations) {
        stations.forEach(s => {
            this.engine.addSatellite(s, 0xFFFFFF, 45)
        })
        this.engine.render();
        this.setState({stations});
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
                <Search stations={stations} onResultClick={this.handleSearchResultClick} />
                <SelectedGroups onChange={this.handleGroupClick}/>
                <SelectedStation selected={selected} onRemoveStation={this.handleRemoveSelected} onStationClick={this.handleRemoveAllSelected}/>
                <div ref={c => this.el = c} style={{ width: '99%', height: '99%' }} />
            </div>
        )
    }
}

export default App;
