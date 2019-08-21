'use strict';

const service = require('./request-service')();

function questionnaireService() {
    function createQuestionnaire(csrfToken) {
        console.log(
            csrfToken,
            process.env.CW_DCS_URL,
            '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@13131313131313131313131313131313@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@'
        );
        const opts = {
            url: `${process.env.CW_DCS_URL}/questionnaires`,
            headers: {
                Authorization: `Bearer ${process.env.CW_DCS_JWT}`
            },
            body: {
                data: {
                    type: 'questionnaires',
                    attributes: {
                        templateName: 'sexual-assault'
                    }
                },
                _csrf: csrfToken
            }
        };
        return service.post(opts);
    }

    function getSection(questionnaireId, section) {
        const opts = {
            url: `${process.env.CW_DCS_URL}/questionnaires/${questionnaireId}/progress-entries?filter[sectionId]=${section}`,
            headers: {
                Authorization: `Bearer ${process.env.CW_DCS_JWT}`
            }
        };
        return service.get(opts);
    }

    function postSection(questionnaireId, section, body, csrfToken) {
        console.log(
            '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@1414141414141414141414@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@'
        );
        const opts = {
            url: `${process.env.CW_DCS_URL}/questionnaires/${questionnaireId}/sections/${section}/answers`,
            headers: {
                Authorization: `Bearer ${process.env.CW_DCS_JWT}`
            },
            body: {
                data: {
                    type: 'answers',
                    attributes: body
                },
                _csrf: csrfToken
            }
        };
        return service.post(opts);
    }

    function getPrevious(questionnaireId, sectionId) {
        const opts = {
            url: `${process.env.CW_DCS_URL}/questionnaires/${questionnaireId}/progress-entries?page[before]=${sectionId}`,
            headers: {
                Authorization: `Bearer ${process.env.CW_DCS_JWT}`
            }
        };
        return service.get(opts);
    }

    function getCurrentSection(currentQuestionnaireId) {
        const opts = {
            url: `${process.env.CW_DCS_URL}/questionnaires/${currentQuestionnaireId}/progress-entries?filter[position]=current`,
            headers: {
                Authorization: `Bearer ${process.env.CW_DCS_JWT}`
            }
        };
        return service.get(opts);
    }

    function getSubmission(questionnaireId) {
        const opts = {
            url: `${process.env.CW_DCS_URL}/questionnaires/${questionnaireId}/submissions`,
            headers: {
                Authorization: `Bearer ${process.env.CW_DCS_JWT}`
            }
        };
        return service.get(opts);
    }

    function postSubmission(questionnaireId, csrfToken) {
        console.log(
            '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@151515151515151515151515@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@'
        );
        const opts = {
            url: `${process.env.CW_DCS_URL}/questionnaires/${questionnaireId}/submissions`,
            headers: {
                Authorization: `Bearer ${process.env.CW_DCS_JWT}`
            },
            body: {
                data: {
                    type: 'submissions',
                    attributes: {
                        questionnaireId
                    }
                },
                _csrf: csrfToken
            }
        };
        return service.post(opts);
    }

    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function getSubmissionStatus(questionnaireId, startingDate) {
        if (Date.now() - startingDate >= 15000) {
            const err = Error(`The upstream server took too long to respond`);
            err.name = 'HTTPError';
            err.statusCode = 504;
            err.error = '504 Gateway Timeout';
            throw err;
        }
        const result = await getSubmission(questionnaireId);
        const {submitted} = result.body.data.attributes;

        if (submitted) {
            return result.body.data.attributes;
        }

        // check again.
        await timeout(1000);
        return getSubmissionStatus(questionnaireId, startingDate);
    }

    return Object.freeze({
        createQuestionnaire,
        getSection,
        postSection,
        getPrevious,
        getCurrentSection,
        getSubmission,
        postSubmission,
        timeout,
        getSubmissionStatus
    });
}

module.exports = questionnaireService;
