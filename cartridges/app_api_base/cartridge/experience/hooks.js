'use strict';

/**
 * is Page Designer page in Edit Mode
 */
function editmode() {
    session.privacy.consent = true; // eslint-disable-line no-undef
}

exports.editmode = editmode;
