import { Engine } from "../satellite-react-app/src/engine";

class App {
    
    state = {
        selected: [],
        stations: [], 
        initialDate: new Date().getTime(),
        currentDate: new Date().getTime(), 
    }

    engineStart() {
        this.engine = new Engine();
        this.engine.initialise();
        //this.addSatellites();
    }

    addSatellites = () => {
        //this.engine.addSatellite(ISS);
    }

}

export default App;