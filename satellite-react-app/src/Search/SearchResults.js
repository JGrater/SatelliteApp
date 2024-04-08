import React from 'react';

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
    
    console.log(station)

    return (
        <div className={'Result ' + (className || '')} onClick={e => onClick && onClick(station)}>
            <p>
                <span className='ResultTitle' title={noradId ? 'NORAD ID: ' + noradId : null}>{station.name}</span>
                <br/>
                <br/>
                <div className='ResultRow'>
                    <span className='ResultInfoTitle'>Inclination: </span>
                    <span className='ResultInfo'>{Math.round(radToDegree(station.satrec.inclo) * 10) / 10}°</span>
                </div>
                <div className='ResultRow'>
                    <span className='ResultInfoTitle'>Altitude: </span>
                    <span className='ResultInfo'>{Math.round(radToDegree(station.satrec.inclo) * 10) / 10}km</span>
                </div>
                <div className='ResultRow'>
                    <span className='ResultInfoTitle'>Longitude: </span>
                    <span className='ResultInfo'>{Math.round(radToDegree(station.satrec.inclo) * 10) / 10}°</span>
                </div>
                <div className='ResultRow'>
                    <span className='ResultInfoTitle'>Latitude: </span>
                    <span className='ResultInfo'>{Math.round(radToDegree(station.satrec.inclo) * 10) / 10}°</span>
                </div>
                <div className='ResultRow'>
                    <span className='ResultInfoTitle'>Apogee: </span>
                    <span className='ResultInfo'>{Math.round(radToDegree(station.satrec.inclo) * 10) / 10}km</span>
                </div>
                <div className='ResultRow'>
                    <span className='ResultInfoTitle'>Perigee: </span>
                    <span className='ResultInfo'>{Math.round(radToDegree(station.satrec.inclo) * 10) / 10}km</span>
                </div>
                <div className='ResultRow'>
                    <span className='ResultInfoTitle'>Speed: </span>
                    <span className='ResultInfo'>{Math.round(radToDegree(station.satrec.inclo) * 10) / 10}m/s</span> 
                </div>
                {onRemoveClick && <span className='RemoveButton' onClick={e => onRemoveClick(station)}>x</span>}
            </p>
        </div>
    )
}

const radToDegree = (radians) => {
    return radians * (180 / Math.PI);
}


export default SearchResults;