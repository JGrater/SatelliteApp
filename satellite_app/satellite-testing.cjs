var satellite = require('satellite.js');

// Sample TLE
var tleLine1 = '1 25544U 98067A   19156.50900463  .00003075  00000-0  59442-4 0  9992',
    tleLine2 = '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442';    

// Initialize a satellite record
var satrec = satellite.twoline2satrec(tleLine1, tleLine2);

//  Or you can use a JavaScript Date
var positionAndVelocity = satellite.propagate(satrec, new Date());

// You will need GMST for some of the coordinate transforms.
// http://en.wikipedia.org/wiki/Sidereal_time#Definition
var gmst = satellite.gstime(new Date());

//var position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

var position = satellite.eciToEcf(positionAndVelocity.position, gmst);


const toThree = (coord) => {
    return { x:coord.x, y:coord.y, z:coord.z};
}

console.log(position.x);
console.log(position.y);
console.log(position.z);

return toThree(position);
