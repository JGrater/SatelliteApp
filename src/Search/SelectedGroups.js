import React, { Component } from 'react';

class SelectedGroups extends Component {

    handleChange = (val) => {
        this.props.onChange(val.target.value)
    }

    render() {
        const { onChange } = this.props;

        return (
            <div className='Groups'>
                <select onChange={this.handleChange}>
                    <option value={"active"}>Active</option>
                    <option value={"geostationary"}>Geostationary</option>
                    <option value={"starlink"}>Starlink</option>
                    <option value={"debris"}>Debris</option>
                </select>
            </div>
        )
    }
    
}

export default SelectedGroups;