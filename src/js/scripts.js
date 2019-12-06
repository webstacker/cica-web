import {createAutocomplete} from '../modules/autocomplete/autocomplete';

(() => {
    const autocomplete = createAutocomplete();
    const selectElements = document.querySelectorAll('.govuk-select');
    autocomplete.init(selectElements);
})();
