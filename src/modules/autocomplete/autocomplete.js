function createAutocomplete() {
    function inputValueTemplate(result) {
        if (typeof result === 'string') {
            return result;
        }
        return result && result.name;
    }

    function suggestionTemplate(result) {
        if (typeof result === 'string') {
            return `<strong>${result.name}</strong>`;
        }
        return result && `<strong>${result.name}</strong>`;
    }

    function onConfirm(result) {
        // eslint-disable-next-line no-undef
        const element = document.querySelector('.govuk-select');
        if (result) {
            const valueToSelect = result.code;
            element.value = valueToSelect;
        } else {
            element.value = '';
        }
    }

    function htmlCollectionToArray(ddElement) {
        // Turn the array-like html collection into an array
        // eslint-disable-next-line prefer-spread
        return Array.apply(null, ddElement.options);
    }

    function formatResults(optionArray) {
        // <option value="100000001">Ayrshire & Arran</option>
        // =>
        // [{code: 100000001, name: 'Ayrshire & Arran'}, ....]
        return optionArray.map(option => ({
            code: option.value,
            name: option.innerHTML
        }));
    }

    /**
     * Initialises the `Enhanced auto-complete` select element implementation.
     *
     * @param {(string|NodeList)} elements - A CSS selector for the elements, or a collection of the elements that are to be turned in to autocomplete select elements.
     *
     * @example
     *
     *     autocomplete.init('.govuk-select');
     *     autocomplete.init(document.querySelectorAll('.govuk-select'));
     */
    function init(elements) {
        let selectElements = elements;

        if (typeof selectElements === 'string') {
            selectElements = document.querySelectorAll(selectElements);
        }

        if (selectElements.length) {
            for (let i = 0; i < selectElements.length; i += 1) {
                selectElements[i].parentNode.classList.add('autocomplete__wrapper');

                accessibleAutocomplete.enhanceSelectElement({
                    selectElement: selectElements[i],
                    id: 'enhanced-dropdown-id',
                    minLength: 2,
                    defaultValue: '',
                    autoselect: true,
                    confirmOnBlur: true,
                    showAllValues: true,
                    displayMenu: 'overlay',
                    onConfirm,
                    // eslint-disable-next-line no-loop-func
                    source: (query, syncResults) => {
                        const resultsArray = htmlCollectionToArray(selectElements[i]);
                        const results = formatResults(resultsArray);

                        syncResults(
                            query
                                ? results.filter(result => {
                                      // Make the user unable to search for and select the place holder.
                                      if (result.code === '') {
                                          return false;
                                      }
                                      return (
                                          result.name.toLowerCase().indexOf(query.toLowerCase()) !==
                                          -1
                                      );
                                  })
                                : []
                        );
                    },
                    templates: {
                        inputValue: inputValueTemplate,
                        suggestion: suggestionTemplate
                    }
                });
            }
        }
    }

    return Object.freeze({
        inputValueTemplate,
        suggestionTemplate,
        onConfirm,
        htmlCollectionToArray,
        formatResults,
        init
    });
}

// eslint-disable-next-line import/prefer-default-export
export {createAutocomplete};
