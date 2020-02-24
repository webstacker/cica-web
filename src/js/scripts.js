/* global SESSION_DURATION */
import createCicaGa from '../modules/ga';
import {createAutocomplete} from '../modules/autocomplete/autocomplete';
import createTimeoutModal from '../modules/modal-timeout';

(() => {
    const cicaGa = createCicaGa(window);
    cicaGa.setUpGAEventTracking();

    const autocomplete = createAutocomplete(window);
    autocomplete.init('.govuk-select');

    const pathName = window.location.pathname;

    if (pathName.startsWith('/apply')) {
        const sessionTimeoutModalElement = window.document.querySelector(
            '#govuk-modal-session-timeout'
        );
        sessionTimeoutModalElement.addEventListener('TIMED_OUT', () => {
            const timeoutEndedModal = createTimeoutModal(window);
            timeoutEndedModal.init({
                element: '#govuk-modal-session-ended',
                resumeElement: '.govuk-modal__continue',
                showIn: [0]
            });
        });

        const timeoutModal = createTimeoutModal(window);
        timeoutModal.init({
            element: '#govuk-modal-session-timeout',
            resumeElement: '.govuk-modal__continue',
            showIn: [
                // show a modal at two-thirds, and fourteen-fifteenths of the session
                // length (rounded down to the nearest 1000).
                // e.g. a session length of 15 minutes results in a modal being
                // shown at 10 minutes, and 14 minutes.
                Math.floor((SESSION_DURATION - SESSION_DURATION / 3) / 1000) * 1000,
                Math.floor((SESSION_DURATION - SESSION_DURATION / 15) / 1000) * 1000
            ]
        });
    }
})();
