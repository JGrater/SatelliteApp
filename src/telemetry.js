import { earthRadius } from "satellite.js/lib/constants";
var satellite = require('satellite.js');

const gravityParameter = 3.986004418e14;

export const degreesToRadians = (degrees) => {
    var radians = degrees * (Math.PI / 180);
    return roundTo2dp(radians);
}

export const radiansToDegrees = (radians) => {
    var degrees = radians * (180 / Math.PI);
    return roundTo2dp(degrees);
}

const roundTo2dp = (number) => {
    return Math.round(number * 100) / 100;
}

const toThree = (v) => {
    return { x: v.x, y: v.z, z: -v.y };
}

const getPropagation = (station, date) => {    
    try {
        station.satrec = satellite.twoline2satrec(station.tleLine1, station.tleLine2);
        station.propagate = satellite.propagate(station.satrec, date);
        return station.propagate;
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

const getGeodeticCoords = (station) => {
    const gmst = satellite.gstime(new Date());
    return satellite.eciToGeodetic(station.propagate.position, gmst);
}

export const getLatitude = (station) => {
    const geodeticCoords = getGeodeticCoords(station);
    var latitude = satellite.degreesLat(geodeticCoords.latitude)
    latitude = roundTo2dp(latitude);
    if (latitude < 0) {
        return (0 - latitude) + "° S";
    } else {
        return latitude + "° N";
    }
}

export const getLongitude = (station) => {
    const geodeticCoords = getGeodeticCoords(station);
    var longitude = satellite.degreesLong(geodeticCoords.longitude)
    longitude = roundTo2dp(longitude);
    if (longitude < 0) {
        return (0 - longitude) + "° W";
    } else {
        return longitude + "° E";
    }
}



export const getAltitude = (station) => {
    const geodeticCoords = getGeodeticCoords(station);
    var altitude = geodeticCoords.height;
    return roundTo2dp(altitude);
}

export const getVelocity = (Vx, Vy, Vz) => {
    var velocity = Math.sqrt(Math.pow(Vx, 2) + Math.pow(Vy, 2) + Math.pow(Vz, 2));
    return(roundTo2dp(velocity))
}

const getSemiMajorAxis = (meanMotion) => {
    var meanMotionRadSec = meanMotion / 60;
    return Math.pow(gravityParameter, (1/3)) / Math.pow(meanMotionRadSec, (2/3));
}

export const getApogee = (station) => {
    var semiMajor = getSemiMajorAxis(station.satrec.no);
    var apogee = semiMajor * (1 + station.satrec.ecco);
    return roundTo2dp((apogee / 1000) - earthRadius);
}

export const getPerigee = (station) => {
    var semiMajor = getSemiMajorAxis(station.satrec.no);
    var perigee = semiMajor * (1 - station.satrec.ecco);
    return roundTo2dp((perigee / 1000) - earthRadius);
}