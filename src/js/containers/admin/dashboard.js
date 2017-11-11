import React, { PureComponent } from 'react';

/**
 * @class Dashboard
 * @extends {PureComponent}
 */
export default class Dashboard extends PureComponent {
    
    /**
     * @constant displayName
     * @type {String}
     */
    static displayName = 'Authenticate/Index/Dashboard';

    /**
     * @method render
     * @return {Object}
     */
    render() {

        return (
            <section className="dashboard">
                <h1>Dashboard</h1>
            </section>
        );

    }

}
