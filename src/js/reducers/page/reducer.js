import * as type from './types';

/**
 * @constant INITIAL_STATE
 * @type {Object}
 */
const INITIAL_STATE = {
    content: null,
    navigation: []
};

export default (state = INITIAL_STATE, action) => {

    switch (action.type) {

        case type.FETCH_PAGE:
            return { ...state, content: action.result };

        case type.FETCH_NAVIGATION:
            return { ...state, navigation: action.result };

    }

    return state;

};
