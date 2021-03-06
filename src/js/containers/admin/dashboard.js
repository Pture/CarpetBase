import React, { PureComponent } from 'react';
import DocumentTitle from 'react-document-title';
import * as config from '../../miscellaneous/config';

/**
 * @class Dashboard
 * @extends {PureComponent}
 */
export default class Dashboard extends PureComponent {

    /**
     * @constant displayName
     * @type {String}
     */
    static displayName = 'Admin/Dashboard';

    /**
     * @method render
     * @return {Object}
     */
    render() {

        return (
            <DocumentTitle title={`${config.DOCUMENT_TITLE_PREPEND} Administrator: Dashboard`}>
                <section className="dashboard">
                    <h1>Dashboard</h1>
                </section>
            </DocumentTitle>
        );

    }

}
