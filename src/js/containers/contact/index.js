import React, { Component, PureComponent } from 'react';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import { values, all } from 'ramda';
import { connect } from 'react-redux';
import GoogleMap from 'google-map-react';
import * as config from '../../miscellaneous/config';
import * as actions from '../../reducers/config/actions';
import withStatuses from '../../behaviours/status';

/**
 * @method mapStateToProps
 * @param {Object} state
 * @return {Object}
 */
export const mapStateToProps = state => {

    return {
        instance: state.config.axiosInstance,
        meta: state.config.meta
    };

};

/**
 * @class Marker
 * @extends {PureComponent}
 */
class Marker extends PureComponent {

    /**
     * @constant propTypes
     * @type {Object}
     */
    static propTypes = {
        text: PropTypes.string.isRequired
    };

    render() {

        return (
            <div className="marker">
                {this.props.text}
            </div>
        );

    }

}

/**
 * @class Connect
 * @extends {PureComponent}
 */
export default withStatuses(connect(mapStateToProps)(class Contact extends Component {

    /**
     * @constant displayName
     * @type {String}
     */
    static displayName = 'Contact/Index';

    /**
     * @constant propTypes
     * @type {Object}
     */
    static propTypes = {
        setSending: PropTypes.func.isRequired,
        setSent: PropTypes.func.isRequired,
        isDisabled: PropTypes.bool.isRequired,
        isSending: PropTypes.bool.isRequired,
        isError: PropTypes.bool.isRequired,
        isSuccess: PropTypes.bool.isRequired,
        meta: PropTypes.shape({
            latitude: PropTypes.string.isRequired,
            longitude: PropTypes.string.isRequired
        }).isRequired,
        instance: PropTypes.func.isRequired
    };

    /**
     * @constant cssDocuments
     * @type {Array}
     */
    static cssDocuments = ['/css/contact.css'];

    /**
     * @method fetchData
     * @param {Function} dispatch
     * @return {Promise}
     */
    static fetchData = ({ dispatch }) => {
        return dispatch(actions.fetchMeta());
    };

    /**
     * @constant state
     * @type {Object}
     */
    state = {
        form: {
            firstName: '',
            lastName: '',
            email: '',
            message: ''
        }
    };

    /**
     * @method submit
     * @param {Object} event
     * @return {Promise}
     */
    submit(event) {

        event.preventDefault();

        this.props.setSending(true);
        this.props.instance.post('/mail.json', this.state.form).then(response => {
            this.props.setSent(response.data.sent);
        });

    }

    /**
     * @method update
     * @param {String} field
     * @return {Function}
     */
    update(field) {

        return event => {
            this.setState({ form: { ...this.state.form, [field]: event.target.value } });
        };

    }

    /**
     * @method latLng
     * @return {Array}
     */
    latLng() {
        return [Number(this.props.meta.latitude), Number(this.props.meta.longitude)];
    }

    /**
     * @method render
     * @return {Object}
     */
    render() {

        const { form } = this.state;
        const { isDisabled, isSending, isError, isSuccess } = this.props;
        const isSubmittable = all(value => value.length > 0)(values(form));
        const [lat, lng] = this.latLng();

        return (
            <DocumentTitle title={`${config.DOCUMENT_TITLE_PREPEND} Contact`}>
                <section className="contact">
                    <section className="map">
                        <GoogleMap center={{ lat, lng }} defaultZoom={14}>
                            <Marker lat={lat} lng={lng} text="CarpetBase" />
                        </GoogleMap>
                    </section>
                    <h1>Contact</h1>
                    <form onSubmit={this.submit.bind(this)}>

                        {isSuccess && (
                            <section className="success">Thank you! Your message has been successfully sent.</section>
                        )}

                        {isError && (
                            <section className="error">Unable to send the e-mail at this moment in time.</section>
                        )}

                        <div className="first-name">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={form.firstName}
                                disabled={isDisabled}
                                onChange={this.update('firstName')}
                                />
                        </div>

                        <div className="last-name">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={form.lastName}
                                disabled={isDisabled}
                                onChange={this.update('lastName')}
                                />
                        </div>

                        <div className="email">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                disabled={isDisabled}
                                onChange={this.update('email')}
                                />
                        </div>

                        <div className="message">
                            <label htmlFor="message">Message</label>
                            <textarea
                                name="message"
                                value={form.message}
                                disabled={isDisabled}
                                onChange={this.update('message')}
                                />
                        </div>

                        <button type="submit" disabled={isSending || isDisabled || !isSubmittable}>
                            {isSending ? 'Sending...' : 'Send'}
                        </button>

                    </form>
                </section>
            </DocumentTitle>
        );

    }

}));
