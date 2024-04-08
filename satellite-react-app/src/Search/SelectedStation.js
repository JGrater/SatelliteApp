import React from 'react';
import { StationCard } from './SearchResults';

export default function({selected, onRemoveStation, onStationClick}) {
    if (!selected || selected.length === 0) return null;

    return (
        <div className='Selected'>
            {selected.map((station, i) => {
                return <StationCard 
                    station={station} 
                    key={station.name + i} 
                    onRemoveClick={onRemoveStation}
                    onClick={onStationClick}
                />
            })}
        </div>
    )
}