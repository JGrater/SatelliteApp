import React from 'react';
import * as Telemetry from '../telemetry.js'

const MaxSearchResults = 100;

const filterResults = (stations, searchText) => {
    if (!stations) return null;
    if (!searchText || searchText === '') return null;

    const regex = new RegExp(searchText, 'i');

    return stations.filter(station => regex.test(station.name)).slice(0, MaxSearchResults);
}

    
const SearchResults = ({stations, searchText, onResultClick}) => {
    const results = filterResults(stations, searchText);
    if (!results) return null;

    return (
        <div className='ResultsWrapper'>
            {results.map((result, i) => <StationCard key={result.name + i} station={result} onClick={onResultClick} />)}
        </div>
    )
}


export const StationCard = ({station, onClick, onRemoveClick, className}) => {

    const noradId = station.satrec && station.satrec.satnum;
    
    return (
        <div className={'Result ' + (className || '')} onClick={e => onClick && onClick(station)}>
            {onRemoveClick && <span className='RemoveButton' onClick={e => onRemoveClick(station)}>x</span>}
            <p>
                <span className='ResultTitle' title={noradId ? 'NORAD ID: ' + noradId : null}>{station.name}</span>
                <br/>
                <br/>
                <div className='ResultRow'>
                    <span className='ResultInfoTitle'>Inclination: </span>
                    <span className='ResultInfo'>{Telemetry.radiansToDegrees(station.satrec.inclo)}°</span>
                </div>
                <div className='ResultRow'>
                    <span className='ResultInfoTitle'>Altitude: </span>
                    <span className='ResultInfo'>{Telemetry.getAltitude(station)}km</span>
                </div>
                <div className='ResultRow'>
                    <span className='ResultInfoTitle'>Latitude: </span>
                    <span className='ResultInfo'>{Telemetry.getLatitude(station)}</span>
                </div>
                <div className='ResultRow'>
                    <span className='ResultInfoTitle'>Longitude: </span>
                    <span className='ResultInfo'>{Telemetry.getLongitude(station)}</span>
                </div>
                <div className='ResultRow'>
                    <span className='ResultInfoTitle'>Apogee: </span>
                    <span className='ResultInfo'>{Telemetry.getApogee(station)}km</span>
                </div>
                <div className='ResultRow'>
                    <span className='ResultInfoTitle'>Perigee: </span>
                    <span className='ResultInfo'>{Telemetry.getPerigee(station)}km</span>
                </div>
                <div className='ResultRow'>
                    <span className='ResultInfoTitle'>Speed: </span>
                    <span className='ResultInfo'>{Telemetry.getVelocity(station.propagate.velocity.x, station.propagate.velocity.y, station.propagate.velocity.z)}km/s</span> 
                </div>
            </p>
        </div>
    )
}

export default SearchResults;