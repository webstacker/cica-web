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
            '#govuk-modal-dialogue-session-timeout'
        );
        sessionTimeoutModalElement.addEventListener('TIMED_OUT', () => {
            const timeoutEndedModal = createTimeoutModal(window);
            timeoutEndedModal.init({
                element: '#govuk-modal-dialogue-session-ended',
                resumeElement: '.govuk-modal-dialogue__continue',
                showIn: [0]
            });
        });

        const timeoutModal = createTimeoutModal(window);
        timeoutModal.init({
            element: '#govuk-modal-dialogue-session-timeout',
            resumeElement: '.govuk-modal-dialogue__continue',
            showIn: [SESSION_DURATION - 5 * 1000, SESSION_DURATION - 1 * 1000]
        });
    }
})();
