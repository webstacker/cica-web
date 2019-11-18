'use strict';

const request = require('supertest');
const csrf = require('csurf');

const formHelper = require('../questionnaire/form-helper');

const createQuestionnaire = require('./test-fixtures/res/get_questionnaire.json');
const getCurrentSection = require('./test-fixtures/res/get_current_section_valid');
const getFirstSection = require('./test-fixtures/res/get_first_section_valid');
const getSectionValid = require('./test-fixtures/res/get_schema_valid');
const getSectionSummaryValid = require('./test-fixtures/res/get_summary_schema_valid');
const getSectionHtmlValid = require('./test-fixtures/transformations/resolved html/p-some-section');
const getProgressEntries = require('./test-fixtures/res/progress_entry_example');
const getProgressEntriesErrors = require('./test-fixtures/res/post_section_returned_errors');
const getPreviousValid = require('./test-fixtures/res/get_previous_valid_sectionId');
const getPreviousValidUrl = require('./test-fixtures/res/get_previous_valid_url');
const postValidSubmission = require('./test-fixtures/res/post_valid_submission');
const postValidSubmissionFailed = require('./test-fixtures/res/post_valid_submission_service_down');

let app;

function replaceCsrfMiddlwareForTest(expressApp) {
    // TODO: find a better way to do this
    // because I cannot alter the contents of the variable that
    // is passed in to the `app.use()` method within the app.js,
    // I need to butcher the stack from the outside so that the
    // csrf stuff is altered after initialisation. If the csrf
    // stuff was extracted out its own middleware then we could
    // just that js file instead.
    // eslint-disable-next-line no-underscore-dangle
    const middlewareStack = expressApp._router.stack;
    let csrfMiddlewareStackIndex = -1;
    let newCsrfMiddlewareStackItem = [];
    let newCsrfMiddlewareStackIndex = -1;
    middlewareStack.forEach((layer, index) => {
        if (layer.name === 'csrf') {
            csrfMiddlewareStackIndex = index;
        }
    });
    if (csrfMiddlewareStackIndex > -1) {
        // eslint-disable-next-line no-underscore-dangle
        expressApp._router.stack.splice(csrfMiddlewareStackIndex, 1);
    }

    const csrfProtection = csrf({
        cookie: false,
        sessionKey: 'cicaSession',
        ignoreMethods: ['GET', 'POST']
    });
    expressApp.use(csrfProtection);

    // look for the new csrf middleware. it should be the last item.
    middlewareStack.forEach((layer, index) => {
        if (layer.name === 'csrf') {
            // get a copy of the new middleware.
            newCsrfMiddlewareStackItem = layer;
            newCsrfMiddlewareStackIndex = index;
            // remove it from the stack.
            // eslint-disable-next-line no-underscore-dangle
            expressApp._router.stack.splice(newCsrfMiddlewareStackIndex, 1);
        }
    });
    // eslint-disable-next-line no-underscore-dangle
    expressApp._router.stack.splice(csrfMiddlewareStackIndex, 0, newCsrfMiddlewareStackItem);
}

function setUpCommonMocks() {
    jest.resetModules();
    jest.doMock('../questionnaire/questionnaire-service', () =>
        jest.fn(() => ({
            createQuestionnaire: () => createQuestionnaire,
            getCurrentSection: () => getCurrentSection,
            getFirstSection: () => getFirstSection
        }))
    );
    // eslint-disable-next-line global-require
    app = require('../app');
    replaceCsrfMiddlwareForTest(app);
}

describe('Data capture service endpoints', () => {
    describe('Cica-web static routes', () => {
        // eslint-disable-next-line global-require
        app = require('../app');
        replaceCsrfMiddlwareForTest(app);
        describe('/', () => {
            describe('GET', () => {
                describe('200', () => {
                    it('Should respond with a 200 status and render the start page', async () => {
                        const response = await request(app).get('/');
                        expect(response.statusCode).toBe(200);
                    });
                    it('Should render a page with the consent heading', async () => {
                        const response = await request(app).get('/');
                        const actual = response.res.text.replace(/\s+/g, '');
                        const pageHeading = `<h1 class="govuk-heading-xl">Help us improve this service</h1>`.replace(
                            /\s+/g,
                            ''
                        );
                        expect(actual).toContain(pageHeading);
                    });
                });
            });
        });
        describe('/start-page', () => {
            describe('GET', () => {
                describe('200', () => {
                    it('Should respond with a 200 status and render the start page', async () => {
                        const response = await request(app).get('/start-page');
                        expect(response.statusCode).toBe(200);
                    });
                    it('Should render a page with the start page heading', async () => {
                        const response = await request(app).get('/start-page');
                        const actual = response.res.text.replace(/\s+/g, '');
                        const pageHeading = `<h1 class="govuk-heading-xl">Claim criminal injuries compensation</h1>`.replace(
                            /\s+/g,
                            ''
                        );
                        expect(actual).toContain(pageHeading);
                    });
                });
            });
        });
        describe('/cookies', () => {
            describe('GET', () => {
                describe('200', () => {
                    it('Should respond with a 200 status and render the cookies page', async () => {
                        const response = await request(app).get('/cookies');
                        expect(response.statusCode).toBe(200);
                    });
                    it('Should render a page with the start page heading', async () => {
                        const response = await request(app).get('/cookies');
                        const actual = response.res.text.replace(/\s+/g, '');
                        const pageHeading = `<h1 class="govuk-heading-xl">Cookies</h1>`.replace(
                            /\s+/g,
                            ''
                        );
                        expect(actual).toContain(pageHeading);
                    });
                });
            });
        });
        describe('/contact-us', () => {
            describe('GET', () => {
                describe('200', () => {
                    it('Should respond with a 200 status and render the contact us page', async () => {
                        const response = await request(app).get('/contact-us');
                        expect(response.statusCode).toBe(200);
                    });
                    it('Should render a page with the start page heading', async () => {
                        const response = await request(app).get('/contact-us');
                        const actual = response.res.text.replace(/\s+/g, '');
                        const pageHeading = `<h1 class="govuk-heading-xl">Contact us</h1>`.replace(
                            /\s+/g,
                            ''
                        );
                        expect(actual).toContain(pageHeading);
                    });
                });
            });
        });
        describe('/transition', () => {
            describe('GET', () => {
                describe('200', () => {
                    it('Should respond with a 200 status and render the transition page', async () => {
                        const response = await request(app).get('/transition');
                        expect(response.statusCode).toBe(200);
                    });
                    it('Should render a page with the start page heading', async () => {
                        const response = await request(app).get('/transition');
                        const actual = response.res.text.replace(/\s+/g, '');
                        const pageHeading = `<h1 class="govuk-heading-xl">We are still working on this part of the service</h1>`.replace(
                            /\s+/g,
                            ''
                        );
                        expect(actual).toContain(pageHeading);
                    });
                });
            });
        });
        describe('*', () => {
            describe('GET', () => {
                describe('200', () => {
                    it('Should respond with a 200 status and render the 404 page', async () => {
                        const response = await request(app).get('/total/nonsense');
                        expect(response.statusCode).toBe(200);
                    });
                    it('Should render a page with the start page heading', async () => {
                        const response = await request(app).get('/other/nonsense');
                        const actual = response.res.text.replace(/\s+/g, '');
                        const pageHeading = `<h1 class="govuk-heading-xl">Page not found</h1>`.replace(
                            /\s+/g,
                            ''
                        );
                        expect(actual).toContain(pageHeading);
                    });
                });
            });
        });
    });

    describe('Cica-web /apply routes', () => {
        describe('/', () => {
            describe('GET', () => {
                describe('302', () => {
                    beforeAll(() => {
                        setUpCommonMocks();
                    });
                    describe('Given no previous cookie', () => {
                        it('Should respond with a found status', async () => {
                            const response = await request.agent(app).get('/apply');

                            expect(response.statusCode).toBe(302);
                        });

                        it('Should redirect the user', async () => {
                            const response = await request.agent(app).get('/apply');

                            expect(response.res.text).toBe(
                                'Found. Redirecting to /apply/applicant-declaration'
                            );
                        });

                        it('Should set a cicaSession cookie', async () => {
                            const response = await request.agent(app).get('/apply');

                            let cookiePresent = false;
                            const cookies = response.header['set-cookie'];
                            cookies.forEach(cookie => {
                                cookiePresent = cookie.startsWith('cicaSession=')
                                    ? true
                                    : cookiePresent;
                            });
                            expect(cookiePresent).toBe(true);
                        });
                    });

                    describe('Given a valid cookie', () => {
                        it('Should respond with a found status', async () => {
                            const currentAgent = request.agent(app);
                            await currentAgent.get('/apply');
                            const response = await currentAgent.get('/apply');

                            expect(response.statusCode).toBe(302);
                        });

                        it('Should redirect the user', async () => {
                            const currentAgent = request.agent(app);
                            await currentAgent.get('/apply');
                            const response = await currentAgent.get('/apply');

                            expect(response.res.text).toBe(
                                'Found. Redirecting to /apply/applicant-enter-your-name'
                            );
                        });
                    });
                });

                describe('404', () => {
                    it('Should fail gracefully given no previous cookie', async () => {
                        jest.resetModules();
                        jest.doMock('../questionnaire/questionnaire-service', () =>
                            jest.fn(() => ({
                                createQuestionnaire: () => {
                                    throw new Error();
                                }
                            }))
                        );
                        // eslint-disable-next-line global-require
                        app = require('../app');
                        replaceCsrfMiddlwareForTest(app);
                        const response = await request.agent(app).get('/apply');

                        expect(response.statusCode).toBe(404);
                    });

                    it('Should fail gracefully given a valid cookie', async () => {
                        jest.resetModules();
                        jest.doMock('../questionnaire/questionnaire-service', () =>
                            jest.fn(() => ({
                                createQuestionnaire: () => createQuestionnaire,
                                getFirstSection: () => {
                                    throw new Error();
                                }
                            }))
                        );
                        // eslint-disable-next-line global-require
                        app = require('../app');
                        replaceCsrfMiddlwareForTest(app);
                        const currentAgent = request.agent(app);
                        await currentAgent.get('/apply');
                        const response = await currentAgent.get('/apply');

                        expect(response.statusCode).toBe(404);
                    });
                });
            });
        });

        describe('/apply/:section', () => {
            describe('GET', () => {
                describe('200', () => {
                    beforeAll(() => {
                        const prefixedSection = 'p-applicant-enter-your-name';
                        const initial = 'p-applicant-declaration';
                        jest.resetModules();
                        jest.doMock('../questionnaire/questionnaire-service', () =>
                            jest.fn(() => ({
                                getSection: () => getSectionValid,
                                createQuestionnaire: () => createQuestionnaire,
                                getCurrentSection: () => getCurrentSection
                            }))
                        );
                        jest.doMock('../questionnaire/form-helper', () => ({
                            addPrefix: () => prefixedSection,
                            getSectionHtml: () => getSectionHtmlValid,
                            removeSectionIdPrefix: () => initial
                        }));
                        // eslint-disable-next-line global-require
                        app = require('../app');
                    });

                    it('Should respond with a success status', async () => {
                        const currentAgent = request.agent(app);
                        await currentAgent.get('/apply/');
                        const response = await currentAgent.get('/apply/applicant-enter-your-name');

                        expect(response.statusCode).toBe(200);
                    });

                    it('Should respond with a valid page', async () => {
                        const currentAgent = request.agent(app);
                        await currentAgent.get('/apply/');
                        const response = await currentAgent.get('/apply/applicant-enter-your-name');

                        expect(response.res.text).toContain('<p>This is a valid page</p>');
                    });

                    describe('Given the page is a summary', () => {
                        beforeAll(() => {
                            const prefixedSection = 'p--check-your-answers';
                            const section = 'check-your-answers';
                            const allAnswers = {answers: 'all of them'};
                            jest.resetModules();
                            jest.doMock('../questionnaire/questionnaire-service', () =>
                                jest.fn(() => ({
                                    getSection: () => getSectionSummaryValid,
                                    createQuestionnaire: () => createQuestionnaire,
                                    getAnswers: () => allAnswers
                                }))
                            );
                            jest.doMock('../questionnaire/form-helper', () => ({
                                addPrefix: () => prefixedSection,
                                getSectionHtml: () => getSectionHtmlValid,
                                removeSectionIdPrefix: () => section
                            }));
                            // eslint-disable-next-line global-require
                            app = require('../app');
                        });

                        it('Should get all answers', async () => {
                            const currentAgent = request.agent(app);
                            await currentAgent.get('/apply/');
                            const response = await currentAgent.get('/apply/check-your-answers');
                            // eslint-disable-next-line global-require
                            const questionnaireService = require('../questionnaire/questionnaire-service')();

                            expect(response.res.text).toContain('<p>This is a valid page</p>');
                            expect(questionnaireService.getAnswers()).toEqual({
                                answers: 'all of them'
                            });
                        });
                    });
                });

                describe('404', () => {
                    beforeAll(() => {
                        const prefixedSection = 'p-applicant-enter-your-name';
                        const initial = 'p-applicant-declaration';
                        jest.resetModules();
                        jest.doMock('../questionnaire/questionnaire-service', () =>
                            jest.fn(() => ({
                                getSection: () => getSectionValid,
                                createQuestionnaire: () => createQuestionnaire,
                                getCurrentSection: () => getCurrentSection
                            }))
                        );
                        jest.doMock('../questionnaire/form-helper', () => ({
                            addPrefix: () => prefixedSection,
                            getSectionHtml: () => {
                                throw new Error();
                            },
                            removeSectionIdPrefix: () => initial
                        }));
                        // eslint-disable-next-line global-require
                        app = require('../app');
                        replaceCsrfMiddlwareForTest(app);
                    });

                    it('Should fail gracefully', async () => {
                        const currentAgent = request.agent(app);
                        await currentAgent.get('/apply/');
                        formHelper.getSectionHtml = jest.fn(() => {
                            throw new Error();
                        });
                        const response = await currentAgent.get('/apply/applicant-enter-your-name');

                        expect(response.statusCode).toBe(404);
                    });
                });
            });

            describe('POST', () => {
                describe('302', () => {
                    describe('No errors', () => {
                        beforeAll(() => {
                            const prefixedSection = 'p-applicant-enter-your-name';
                            const section = 'applicant-enter-your-name';
                            const processedAnswer = {'q-applicant-title': 'Mr'};
                            jest.resetModules();
                            jest.doMock('../questionnaire/questionnaire-service', () =>
                                jest.fn(() => ({
                                    postSection: () => getProgressEntries,
                                    createQuestionnaire: () => createQuestionnaire,
                                    getCurrentSection: () => getCurrentSection
                                }))
                            );
                            jest.doMock('../questionnaire/form-helper', () => ({
                                addPrefix: () => prefixedSection,
                                getSectionHtmlWithErrors: () => getSectionHtmlValid,
                                removeSectionIdPrefix: () => section,
                                processRequest: () => processedAnswer,
                                getNextSection: () => section
                            }));
                            // eslint-disable-next-line global-require
                            app = require('../app');
                            replaceCsrfMiddlwareForTest(app);
                        });

                        it('Should respond with a found status if there are no errors', async () => {
                            const currentAgent = request.agent(app);
                            await currentAgent.get('/apply/');
                            const response = await currentAgent.post(
                                '/apply/applicant-enter-your-name'
                            );

                            expect(response.statusCode).toBe(302);
                            expect(response.res.text).toBe(
                                'Found. Redirecting to /apply/applicant-enter-your-name'
                            );
                        });

                        it('Should redirect the user if there are no errors', async () => {
                            const currentAgent = request.agent(app);
                            await currentAgent.get('/apply/');
                            const response = await currentAgent.post(
                                '/apply/applicant-enter-your-name'
                            );

                            expect(response.res.text).toBe(
                                'Found. Redirecting to /apply/applicant-enter-your-name'
                            );
                        });
                    });
                    describe('With errors', () => {
                        beforeAll(() => {
                            const prefixedSection = 'p-applicant-enter-your-name';
                            const section = 'applicant-enter-your-name';
                            const processedAnswer = {'q-applicant-title': 'Mr'};
                            jest.resetModules();
                            jest.doMock('../questionnaire/questionnaire-service', () =>
                                jest.fn(() => ({
                                    getSection: () => getSectionValid,
                                    postSection: () => getProgressEntriesErrors,
                                    createQuestionnaire: () => createQuestionnaire,
                                    getCurrentSection: () => getCurrentSection
                                }))
                            );
                            jest.doMock('../questionnaire/form-helper', () => ({
                                addPrefix: () => prefixedSection,
                                getSectionHtmlWithErrors: () => getSectionHtmlValid,
                                removeSectionIdPrefix: () => section,
                                processRequest: () => processedAnswer,
                                getNextSection: () => section,
                                getSectionHtml: () => getSectionHtmlValid
                            }));
                            // eslint-disable-next-line global-require
                            app = require('../app');
                            replaceCsrfMiddlwareForTest(app);
                        });

                        it('Should render the schema again with errors', async () => {
                            const currentAgent = request.agent(app);
                            await currentAgent.get('/apply/');
                            await currentAgent.post('/apply/applicant-enter-your-name');
                            const response = await currentAgent
                                // then post to the page with the token.
                                .post('/apply/applicant-enter-your-name')
                                .send();

                            expect(response.res.text).toContain('<p>This is a valid page</p>');
                        });
                    });
                });
                describe('404', () => {
                    beforeAll(() => {
                        const prefixedSection = 'p-applicant-enter-your-name';
                        const section = 'applicant-enter-your-name';
                        const processedAnswer = {'q-applicant-title': 'Mr'};
                        jest.resetModules();
                        jest.doMock('../questionnaire/questionnaire-service', () =>
                            jest.fn(() => ({
                                postSection: () => {
                                    throw new Error();
                                },
                                createQuestionnaire: () => createQuestionnaire,
                                getCurrentSection: () => getCurrentSection
                            }))
                        );
                        jest.doMock('../questionnaire/form-helper', () => ({
                            addPrefix: () => prefixedSection,
                            getSectionHtmlWithErrors: () => getSectionHtmlValid,
                            removeSectionIdPrefix: () => section,
                            processRequest: () => processedAnswer,
                            getNextSection: () => section
                        }));
                        // eslint-disable-next-line global-require
                        app = require('../app');
                        replaceCsrfMiddlwareForTest(app);
                    });

                    it('Should fail gracefully', async () => {
                        const currentAgent = request.agent(app);
                        await currentAgent.get('/apply/');
                        formHelper.getSectionHtml = jest.fn(() => {
                            throw new Error();
                        });
                        const response = await currentAgent.post(
                            '/apply/applicant-enter-your-name'
                        );

                        expect(response.statusCode).toBe(404);
                    });
                });
            });
        });

        describe('/apply/previous/:section', () => {
            describe('GET', () => {
                describe('200', () => {
                    describe('Given a sectionId', () => {
                        beforeAll(() => {
                            const prefixedSection = 'p-applicant-enter-your-name';
                            const section = 'applicant-declaration';
                            const processedAnswer = {'q-applicant-title': 'Mr'};
                            jest.resetModules();
                            jest.doMock('../questionnaire/questionnaire-service', () =>
                                jest.fn(() => ({
                                    getSection: () => getSectionValid,
                                    postSection: () => getProgressEntries,
                                    getPrevious: () => getPreviousValid,
                                    createQuestionnaire: () => createQuestionnaire,
                                    getCurrentSection: () => getCurrentSection
                                }))
                            );
                            jest.doMock('../questionnaire/form-helper', () => ({
                                addPrefix: () => prefixedSection,
                                removeSectionIdPrefix: () => section,
                                getSectionHtml: () => getSectionHtmlValid,
                                processRequest: () => processedAnswer,
                                getNextSection: () => section
                            }));
                            // eslint-disable-next-line global-require
                            app = require('../app');
                            replaceCsrfMiddlwareForTest(app);
                        });
                        it('Should redirect to a section', async () => {
                            const currentAgent = request.agent(app);
                            await currentAgent.get('/apply/');
                            const response = await currentAgent.get(
                                '/apply/previous/applicant-enter-your-name'
                            );
                            expect(response.statusCode).toBe(302);
                        });
                        it('Should identify and render an external URL', async () => {
                            const currentAgent = request.agent(app);
                            await currentAgent.get('/apply/');
                            await currentAgent.get('/apply/applicant-enter-your-name');
                            // then post to the page with the token.
                            const response = await currentAgent.post(
                                '/apply/applicant-enter-your-name'
                            );

                            expect(response.res.text).toBe(
                                'Found. Redirecting to /apply/applicant-declaration'
                            );
                        });
                    });

                    describe('Given a URL', () => {
                        beforeAll(() => {
                            const prefixedSection = 'p-applicant-enter-your-name';
                            const Section = 'applicant-declaration';
                            jest.resetModules();
                            jest.doMock('../questionnaire/questionnaire-service', () =>
                                // return a modified factory function, that returns an object with a method, that returns a valid created response
                                jest.fn(() => ({
                                    getPrevious: () => getPreviousValidUrl,
                                    createQuestionnaire: () => createQuestionnaire
                                }))
                            );
                            jest.doMock('../questionnaire/form-helper', () => ({
                                addPrefix: () => prefixedSection,
                                removeSectionIdPrefix: () => Section
                            }));
                            // eslint-disable-next-line global-require
                            app = require('../app');
                            replaceCsrfMiddlwareForTest(app);
                        });
                        it('Should respond with a found status', async () => {
                            const currentAgent = request.agent(app);
                            await currentAgent.get('/apply/');
                            const response = await currentAgent.get(
                                '/apply/previous/applicant-enter-your-name'
                            );

                            expect(response.statusCode).toBe(302);
                        });
                        it('Should redirect the user', async () => {
                            const currentAgent = request.agent(app);
                            await currentAgent.get('/apply/');
                            const response = await currentAgent.get(
                                '/apply/previous/applicant-enter-your-name'
                            );

                            expect(response.res.text).toBe(
                                'Found. Redirecting to http://www.google.com/'
                            );
                        });
                    });
                });
                describe('404', () => {
                    it('Should fail gracefully', async () => {
                        jest.resetModules();
                        jest.doMock('../questionnaire/questionnaire-service', () =>
                            // return a modified factory function, that returns an object with a method, that returns a valid created response
                            jest.fn(() => ({
                                createQuestionnaire: () => createQuestionnaire,
                                getPrevious() {
                                    const err = Error(`The page was not found`);
                                    err.name = 'HTTPError';
                                    err.statusCode = 404;
                                    err.error = '404 Not Found';
                                    throw err;
                                }
                            }))
                        );
                        // eslint-disable-next-line global-require
                        app = require('../app');
                        replaceCsrfMiddlwareForTest(app);

                        const currentAgent = request.agent(app);
                        await currentAgent.get('/apply/');
                        formHelper.removeSectionIdPrefix = jest.fn(() => 'applicant-declaration');
                        const response = await currentAgent.get(
                            '/apply/previous/applicant-enter-your-name'
                        );

                        expect(response.statusCode).toBe(404);
                    });

                    it('Should default to a 404 error is no status code is provided.', async () => {
                        jest.resetModules();
                        jest.doMock('../questionnaire/questionnaire-service', () =>
                            // return a modified factory function, that returns an object with a method, that returns a valid created response
                            jest.fn(() => ({
                                createQuestionnaire: () => createQuestionnaire,
                                getPrevious() {
                                    throw new Error();
                                }
                            }))
                        );
                        // eslint-disable-next-line global-require
                        app = require('../app');
                        replaceCsrfMiddlwareForTest(app);
                        const currentAgent = request.agent(app);
                        await currentAgent.get('/apply/');
                        formHelper.removeSectionIdPrefix = jest.fn(() => 'applicant-declaration');
                        const response = await currentAgent.get(
                            '/apply/previous/applicant-enter-your-name'
                        );

                        expect(response.statusCode).toBe(404);
                    });
                });
            });
        });

        describe('/apply/submission/confirm', () => {
            describe('POST', () => {
                describe('302', () => {
                    beforeAll(() => {
                        const sectionIdNoPrefix = 'confirmation';
                        jest.resetModules();
                        jest.doMock('../questionnaire/questionnaire-service', () =>
                            // return a modified factory function, that returns an object with a method, that returns a valid created response
                            jest.fn(() => ({
                                postSubmission: () => {},
                                getSubmissionStatus: () => postValidSubmission,
                                createQuestionnaire: () => createQuestionnaire,
                                getCurrentSection: () => getCurrentSection
                            }))
                        );
                        jest.doMock('../questionnaire/form-helper', () => ({
                            removeSectionIdPrefix: () => sectionIdNoPrefix
                        }));
                        // eslint-disable-next-line global-require
                        app = require('../app');
                        replaceCsrfMiddlwareForTest(app);
                    });

                    it('Should respond with a found status', async () => {
                        const currentAgent = request.agent(app);
                        await currentAgent.get('/apply/');
                        const response = await currentAgent.post('/apply/submission/confirm');
                        expect(response.statusCode).toBe(302);
                    });

                    it('Should redirect the user to the confirmation page', async () => {
                        const currentAgent = request.agent(app);
                        await currentAgent.get('/apply/');
                        const response = await currentAgent.post('/apply/submission/confirm');
                        expect(response.res.text).toBe('Found. Redirecting to /apply/confirmation');
                    });
                });
                describe('404', () => {
                    beforeAll(() => {
                        jest.resetModules();
                        jest.doMock('../questionnaire/questionnaire-service', () =>
                            // return a modified factory function, that returns an object with a method, that returns a valid created response
                            jest.fn(() => ({
                                postSubmission: () => {},
                                getSubmissionStatus: () => {},
                                createQuestionnaire: () => createQuestionnaire
                            }))
                        );
                        // eslint-disable-next-line global-require
                        app = require('../app');
                        replaceCsrfMiddlwareForTest(app);
                    });

                    it('Should fail gracefully', async () => {
                        const currentAgent = request.agent(app);
                        await currentAgent.get('/apply/');
                        const response = await currentAgent.post('/apply/submission/confirm');
                        expect(response.statusCode).toBe(404);
                    });
                });
                describe('503', () => {
                    beforeAll(() => {
                        jest.resetModules();
                        jest.doMock('../questionnaire/questionnaire-service', () =>
                            // return a modified factory function, that returns an object with a method, that returns a valid created response
                            jest.fn(() => ({
                                postSubmission: () => {},
                                getSubmissionStatus: () => postValidSubmissionFailed,
                                createQuestionnaire: () => createQuestionnaire
                            }))
                        );
                        // eslint-disable-next-line global-require
                        app = require('../app');
                        replaceCsrfMiddlwareForTest(app);
                    });

                    it('Should tell the user the service is unavailable', async () => {
                        const currentAgent = request.agent(app);
                        await currentAgent.get('/apply/');
                        const response = await currentAgent.post('/apply/submission/confirm');
                        expect(response.statusCode).toBe(500);
                    });
                });
                describe('504', () => {
                    beforeAll(() => {
                        jest.resetModules();
                        jest.doMock('../questionnaire/questionnaire-service', () =>
                            // return a modified factory function, that returns an object with a method, that returns a valid created response
                            jest.fn(() => ({
                                postSubmission: () => {},
                                getSubmissionStatus() {
                                    const err = Error(
                                        `The upstream server took too long to respond`
                                    );
                                    err.name = 'HTTPError';
                                    err.statusCode = 504;
                                    err.error = '504 Gateway Timeout';
                                    throw err;
                                },
                                createQuestionnaire: () => createQuestionnaire
                            }))
                        );
                        // eslint-disable-next-line global-require
                        app = require('../app');
                        replaceCsrfMiddlwareForTest(app);
                    });

                    it('Should throw a 504 if the service times out', async () => {
                        const currentAgent = request.agent(app);
                        await currentAgent.get('/apply/');
                        const response = await currentAgent.post('/apply/submission/confirm');
                        expect(response.statusCode).toBe(504);
                    });
                });
            });
        });

        describe('/apply/:section?next=<some section id>', () => {
            beforeEach(() => {
                // tidy up from previous tests
                jest.resetModules();
                jest.unmock('../questionnaire/questionnaire-service');
                jest.unmock('../questionnaire/form-helper');
                jest.unmock('client-sessions');

                // mock cookie
                jest.doMock('client-sessions', () => () => (req, res, next) => {
                    req.cicaSession = {
                        questionnaireId: 'c7f3b592-b7ac-4f2a-ab9c-8af407ade8cd'
                    };

                    next();
                });
            });

            it('should redirect to the prescribed next section id if available', async () => {
                jest.doMock('../questionnaire/request-service', () => {
                    const api = `${process.env.CW_DCS_URL}/api/v1/questionnaires/c7f3b592-b7ac-4f2a-ab9c-8af407ade8cd`;

                    return () => ({
                        post: options => {
                            const responses = {
                                [`${api}/sections/p-applicant-enter-your-name/answers`]: {
                                    statusCode: 201
                                }
                            };

                            return responses[options.url];
                        },
                        get: options => {
                            const responses = {
                                [`${api}/progress-entries?filter[sectionId]=p--check-your-answers`]: {
                                    statusCode: 200,
                                    body: {
                                        data: [
                                            {
                                                attributes: {
                                                    sectionId: 'p--check-your-answers'
                                                }
                                            }
                                        ]
                                    }
                                }
                            };

                            return responses[options.url];
                        }
                    });
                });

                // eslint-disable-next-line global-require
                app = require('../app');
                replaceCsrfMiddlwareForTest(app);

                const response = await request(app).post(
                    '/apply/applicant-enter-your-name?next=check-your-answers'
                );

                expect(response.statusCode).toBe(302);
                expect(response.res.text).toBe('Found. Redirecting to /apply/check-your-answers');
            });

            it('should redirect to the current section if the prescribed next section id is not available', async () => {
                jest.doMock('../questionnaire/request-service', () => {
                    const api = `${process.env.CW_DCS_URL}/api/v1/questionnaires/c7f3b592-b7ac-4f2a-ab9c-8af407ade8cd`;

                    return () => ({
                        post: options => {
                            const responses = {
                                [`${api}/sections/p-applicant-are-you-18-or-over/answers`]: {
                                    statusCode: 201
                                }
                            };

                            return responses[options.url];
                        },
                        get: options => {
                            const responses = {
                                [`${api}/progress-entries?filter[sectionId]=p--check-your-answers`]: {
                                    statusCode: 404
                                },
                                [`${api}/progress-entries?filter[position]=current`]: {
                                    statusCode: 200,
                                    body: {
                                        data: [
                                            {
                                                attributes: {
                                                    sectionId:
                                                        'p-applicant-redirect-to-our-other-application'
                                                }
                                            }
                                        ]
                                    }
                                }
                            };

                            return responses[options.url];
                        }
                    });
                });

                // eslint-disable-next-line global-require
                app = require('../app');
                replaceCsrfMiddlwareForTest(app);

                const response = await request(app).post(
                    '/apply/applicant-are-you-18-or-over?next=check-your-answers'
                );

                expect(response.statusCode).toBe(302);
                expect(response.res.text).toBe(
                    'Found. Redirecting to /apply/applicant-redirect-to-our-other-application'
                );
            });
        });
    });
});
