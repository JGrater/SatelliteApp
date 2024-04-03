var satellite = require('satellite.js');

const toThree = (v) => {
    return { x: v.x, y: v.z, z: -v.y };
}

const getPropagation = (station, date) => {    
    try {
        station.satrec = satellite.twoline2satrec(station.tleLine1, station.tleLine2);
        return satellite.propagate(station.satrec, date);
    } catch (error) {
        console.error('Error propagating satellite position:', error);
        return null;
    }
}

// type: 1 ECEF coordinates   2: ECI coordinates
export const getPositionFromTle = (station, date, type = 1) => {
    if (!station || !date) return null;

    const positionVelocity = getPropagation(station, date);
    if (!positionVelocity || isNaN(positionVelocity.position.x) || isNaN(positionVelocity.position.y) || isNaN(positionVelocity.position.z)) {
        console.error("Invalid position data or NaN values.");
        return null;
    }
    
    const gmst = satellite.gstime(date);
    const positionEcf = satellite.eciToEcf(positionVelocity.position, gmst);
    return toThree(positionEcf);
}
/*
var ISS = { 
    tleLine1: '1 25544U 98067A   19156.50900463  .00003075  00000-0  59442-4 0  9992',
    tleLine2: '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442',
}

console.log(getPositionFromTle(ISS, new Date()));
*/