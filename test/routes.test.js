'use strict';

const request = require('supertest');
const formHelper = require('../questionnaire/form-helper');

let agent;
let app;

const createQuestionnaire = require('./test-fixtures/res/get_questionnaire.json');
const createQuestionnaireInvalid = require('./test-fixtures/res/get_invalid_questionnaire.json');
const getSectionValid = require('./test-fixtures/res/get_schema_valid');
const getPreviousValid = require('./test-fixtures/res/get_previous_valid');
const getPreviousNameValid = require('./test-fixtures/res/get_previous_with_override');
const postValidSubmission = require('./test-fixtures/res/post_valid_submission');
const getSectionHtmlValid = require('./test-fixtures/transformations/resolved html/p-some-section');
const getCurrentSection = require('./test-fixtures/res/get_current_section_valid');

// const questionnaireService = require('../questionnaire/questionnaire-service');

describe('Data capture service endpoints', () => {
    describe('Cica-web static routes', () => {
        beforeAll(() => {
            // eslint-disable-next-line global-require
            app = require('../app');
        });
        describe('/', () => {
            describe('GET', () => {
                describe('200', () => {
                    it('Should respond with a 200 status', async () => {
                        const response = await request(app).get('/');
                        expect(response.statusCode).toBe(200);
                    });
                    it('Should render a page with the consent heading', async () => {
                        const response = await request(app).get('/');
                        const actual = response.res.text.replace(/\s+/g, '');
                        const pageHeading = `<h1 class="govuk-heading-xl">Help us test a new criminal injuries compensation service</h1>`.replace(
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
                    it('Should respond with a 200 status', async () => {
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
                    it('Should respond with a 200 status', async () => {
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
                    it('Should respond with a 200 status', async () => {
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
                    it('Should respond with a 200 status', async () => {
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
    });
    describe('Cica-web /apply routes', () => {
        beforeEach(() => {
            jest.resetModules();
        });
        describe('/', () => {
            describe('GET', () => {
                describe('302', () => {
                    beforeAll(() => {
                        jest.doMock('../questionnaire/questionnaire-service', () =>
                            // return a modified factory function, that returns an object with a method, that returns a valid created response
                            jest.fn(() => ({
                                createQuestionnaire: () => createQuestionnaire,
                                getCurrentSection: () => getCurrentSection
                            }))
                        );
                        // eslint-disable-next-line global-require
                        app = require('../app');
                    });
                    it('Should respond with a found status', () => {
                        agent = request.agent(app);
                        return agent.get('/apply/').then(() => {
                            formHelper.removeSectionIdPrefix = jest.fn(
                                () => 'applicant-enter-your-address'
                            );
                            return agent
                                .get('/apply/')
                                .set(
                                    'Cookie',
                                    'cicaSession=mzBCUTUQGsOT36H6Bvvy5w.D-Om63et1DE6qXBbDvSbsG9A-nw_jL29edAzRc74M7ELpS5am1meqsbNXr5eNhVjQip3H0dRWS9gyIua1h6SVxVPd8X-4BcV4K4RXwnzhEc.1565175346779.900000.4UB0eoITG2We5EDID3nrODqlVqqSzuV72tiJXuzreDg;'
                                )
                                .then(response => {
                                    expect(response.statusCode).toBe(302);
                                });
                        });
                    });
                    it('Should redirect the user', () => {
                        agent = request.agent(app);
                        return agent.get('/apply/').then(response => {
                            expect(response.res.text).toBe(
                                'Found. Redirecting to /apply/applicant-enter-your-address'
                            );
                        });
                    });
                    it('Should set a cicaSession cookie', () => {
                        agent = request.agent(app);
                        return agent.get('/apply/').then(response => {
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
                });
                describe('404', () => {
                    beforeAll(() => {
                        jest.resetModules();
                        jest.doMock('../questionnaire/questionnaire-service', () =>
                            // return a modified factory function, that returns an object with a method, that returns a valid created response
                            jest.fn(() => ({
                                createQuestionnaire: () => createQuestionnaireInvalid
                            }))
                        );
                        // eslint-disable-next-line global-require
                        app = require('../app');
                    });
                    it('Should fail gracefully', () => {
                        agent = request.agent(app);
                        return agent.get('/apply').then(response => {
                            expect(response.statusCode).toBe(404);
                        });
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
                            // return a modified factory function, that returns an object with a method, that returns a valid created response
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
                    it('Should respond with a success status', () => {
                        agent = request.agent(app);
                        return agent.get('/apply/').then(() =>
                            agent
                                .get('/apply/applicant-enter-your-name')
                                .set(
                                    'Cookie',
                                    'cicaSession=te3AFsfQozY49T4FIL8lEA.K2YvZ_eUm0YcCg2IA_qtCorcS2T17Td11LC0WmYuTaWc5PQuHcoCTHPuOPQoWVy_R5tUX4vzV4_pENOBxk1xPg0obdlP4suxaGK2YdqxjAE.1565864591496.900000.NwyQHlNP62CAiD-sk2GuuJvLzAQEZjX364hfnLp06yA;'
                                )
                                .then(response => {
                                    expect(response.statusCode).toBe(200);
                                })
                        );
                    });
                    it('Should respond with a valid page', () => {
                        agent = request.agent(app);
                        return agent.get('/apply').then(() =>
                            agent
                                .get('/apply/applicant-enter-your-name')
                                .set(
                                    'Cookie',
                                    'cicaSession=mzBCUTUQGsOT36H6Bvvy5w.D-Om63et1DE6qXBbDvSbsG9A-nw_jL29edAzRc74M7ELpS5am1meqsbNXr5eNhVjQip3H0dRWS9gyIua1h6SVxVPd8X-4BcV4K4RXwnzhEc.1565175346779.900000.4UB0eoITG2We5EDID3nrODqlVqqSzuV72tiJXuzreDg;'
                                )
                                .then(response => {
                                    expect(response.res.text).toContain(
                                        '<p>This is a valid page</p>'
                                    );
                                })
                        );
                    });
                });
                describe('404', () => {
                    beforeAll(() => {
                        const prefixedSection = 'p-applicant-enter-your-name';
                        const initial = 'p-applicant-declaration';
                        jest.resetModules();
                        jest.doMock('../questionnaire/questionnaire-service', () =>
                            // return a modified factory function, that returns an object with a method, that returns a valid created response
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
                    });
                    it('Should fail gracefully', async () => {
                        agent = request.agent(app);
                        return agent.get('/apply/').then(() => {
                            formHelper.getSectionHtml = jest.fn(() => {
                                throw new Error();
                            });
                            return agent
                                .get('/apply/applicant-enter-your-name')
                                .set(
                                    'Cookie',
                                    'cicaSession=mzBCUTUQGsOT36H6Bvvy5w.D-Om63et1DE6qXBbDvSbsG9A-nw_jL29edAzRc74M7ELpS5am1meqsbNXr5eNhVjQip3H0dRWS9gyIua1h6SVxVPd8X-4BcV4K4RXwnzhEc.1565175346779.900000.4UB0eoITG2We5EDID3nrODqlVqqSzuV72tiJXuzreDg;'
                                )
                                .then(response => {
                                    expect(response.statusCode).toBe(404);
                                });
                        });
                    });
                });
            });
        });
        describe('/apply/previous/:section', () => {
            describe('GET', () => {
                describe('200', () => {
                    describe('Given a specified link', () => {
                        beforeAll(() => {
                            const prefixedSection = 'p-applicant-enter-your-name';
                            const initial = 'p-applicant-declaration';
                            jest.doMock('../questionnaire/questionnaire-service', () =>
                                // return a modified factory function, that returns an object with a method, that returns a valid created response
                                jest.fn(() => ({
                                    getPrevious: () => getPreviousValid,
                                    createQuestionnaire: () => createQuestionnaire,
                                    getCurrentSection: () => getCurrentSection
                                }))
                            );
                            jest.doMock('../questionnaire/form-helper', () => ({
                                addPrefix: () => prefixedSection,
                                removeSectionIdPrefix: () => initial
                            }));
                            // eslint-disable-next-line global-require
                            app = require('../app');
                        });
                        it('Should identify and render a static page', () => {
                            agent = request.agent(app);
                            return agent.get('/apply/').then(() => {
                                formHelper.removeSectionIdPrefix = jest.fn(
                                    () => 'applicant-declaration'
                                );
                                return agent
                                    .get('/apply/previous/applicant-enter-your-name')
                                    .set(
                                        'Cookie',
                                        'cicaSession=mzBCUTUQGsOT36H6Bvvy5w.D-Om63et1DE6qXBbDvSbsG9A-nw_jL29edAzRc74M7ELpS5am1meqsbNXr5eNhVjQip3H0dRWS9gyIua1h6SVxVPd8X-4BcV4K4RXwnzhEc.1565175346779.900000.4UB0eoITG2We5EDID3nrODqlVqqSzuV72tiJXuzreDg;'
                                    )
                                    .then(response => {
                                        expect(response.statusCode).toBe(302);
                                    });
                            });
                        });
                        it('Should identify and render an external URL', () => {
                            agent = request.agent(app);
                            return agent.get('/apply/').then(() => {
                                formHelper.removeSectionIdPrefix = jest.fn(
                                    () => 'applicant-declaration'
                                );
                                return agent
                                    .get('/apply/previous/applicant-enter-your-name')
                                    .set(
                                        'Cookie',
                                        'cicaSession=mzBCUTUQGsOT36H6Bvvy5w.D-Om63et1DE6qXBbDvSbsG9A-nw_jL29edAzRc74M7ELpS5am1meqsbNXr5eNhVjQip3H0dRWS9gyIua1h6SVxVPd8X-4BcV4K4RXwnzhEc.1565175346779.900000.4UB0eoITG2We5EDID3nrODqlVqqSzuV72tiJXuzreDg;'
                                    )
                                    .then(response => {
                                        expect(response.res.text).toBe(
                                            'Found. Redirecting to /apply/applicant-declaration'
                                        );
                                    });
                            });
                        });
                    });
                    describe('Given a section name', () => {
                        beforeAll(() => {
                            jest.doMock('../questionnaire/questionnaire-service', () =>
                                // return a modified factory function, that returns an object with a method, that returns a valid created response
                                jest.fn(() => ({
                                    getPrevious: () => getPreviousNameValid,
                                    createQuestionnaire: () => createQuestionnaire
                                }))
                            );
                            // eslint-disable-next-line global-require
                            app = require('../app');
                        });
                        it('Should respond with a found status', () => {
                            agent = request.agent(app);
                            return agent.get('/apply/').then(() => {
                                formHelper.removeSectionIdPrefix = jest.fn(
                                    () => 'applicant-enter-your-date-of-birth'
                                );
                                return agent
                                    .get('/apply/previous/applicant-enter-your-name')
                                    .set(
                                        'Cookie',
                                        'cicaSession=mzBCUTUQGsOT36H6Bvvy5w.D-Om63et1DE6qXBbDvSbsG9A-nw_jL29edAzRc74M7ELpS5am1meqsbNXr5eNhVjQip3H0dRWS9gyIua1h6SVxVPd8X-4BcV4K4RXwnzhEc.1565175346779.900000.4UB0eoITG2We5EDID3nrODqlVqqSzuV72tiJXuzreDg;'
                                    )
                                    .then(response => {
                                        expect(response.statusCode).toBe(302);
                                    });
                            });
                        });
                        it('Should redirect the user', () => {
                            agent = request.agent(app);
                            return agent.get('/apply/').then(() => {
                                formHelper.removeSectionIdPrefix = jest.fn(
                                    () => 'applicant-enter-your-date-of-birth'
                                );
                                return agent
                                    .get('/apply/previous/applicant-enter-your-name')
                                    .set(
                                        'Cookie',
                                        'cicaSession=mzBCUTUQGsOT36H6Bvvy5w.D-Om63et1DE6qXBbDvSbsG9A-nw_jL29edAzRc74M7ELpS5am1meqsbNXr5eNhVjQip3H0dRWS9gyIua1h6SVxVPd8X-4BcV4K4RXwnzhEc.1565175346779.900000.4UB0eoITG2We5EDID3nrODqlVqqSzuV72tiJXuzreDg;'
                                    )
                                    .then(response => {
                                        expect(response.res.text).toBe(
                                            'Found. Redirecting to /apply/applicant-enter-your-date-of-birth'
                                        );
                                    });
                            });
                        });
                    });
                });
                describe('404', () => {
                    beforeAll(() => {
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
                    });
                    it('Should fail gracefully', () => {
                        agent = request.agent(app);
                        return agent.get('/apply/').then(() => {
                            formHelper.removeSectionIdPrefix = jest.fn(
                                () => 'applicant-declaration'
                            );
                            return agent
                                .get('/apply/previous/applicant-enter-your-name')
                                .set(
                                    'Cookie',
                                    'cicaSession=mzBCUTUQGsOT36H6Bvvy5w.D-Om63et1DE6qXBbDvSbsG9A-nw_jL29edAzRc74M7ELpS5am1meqsbNXr5eNhVjQip3H0dRWS9gyIua1h6SVxVPd8X-4BcV4K4RXwnzhEc.1565175346779.900000.4UB0eoITG2We5EDID3nrODqlVqqSzuV72tiJXuzreDg;'
                                )
                                .then(response => {
                                    expect(response.statusCode).toBe(404);
                                });
                        });
                    });
                });
            });
        });
        describe('/apply/submission/confirm', () => {
            describe('POST', () => {
                describe('201', () => {
                    beforeAll(() => {
                        jest.doMock('../questionnaire/questionnaire-service', () =>
                            // return a modified factory function, that returns an object with a method, that returns a valid created response
                            jest.fn(() => ({
                                postSubmission: () => {},
                                getSubmissionStatus: () => postValidSubmission,
                                createQuestionnaire: () => createQuestionnaire
                            }))
                        );
                        // eslint-disable-next-line global-require
                        app = require('../app');
                    });
                    it('Should respond with a found status', () => {
                        agent = request.agent(app);
                        return agent.get('/apply/').then(() =>
                            agent
                                .post('/apply/submission/confirm')
                                .set(
                                    'Cookie',
                                    'cicaSession=mzBCUTUQGsOT36H6Bvvy5w.D-Om63et1DE6qXBbDvSbsG9A-nw_jL29edAzRc74M7ELpS5am1meqsbNXr5eNhVjQip3H0dRWS9gyIua1h6SVxVPd8X-4BcV4K4RXwnzhEc.1565175346779.900000.4UB0eoITG2We5EDID3nrODqlVqqSzuV72tiJXuzreDg;'
                                )
                                .then(response => {
                                    expect(response.statusCode).toBe(302);
                                })
                        );
                    });
                    it('Should redirect the user to the confirmation page', () => {
                        agent = request.agent(app);
                        return agent.get('/apply/').then(() =>
                            agent
                                .post('/apply/submission/confirm')
                                .set(
                                    'Cookie',
                                    'cicaSession=mzBCUTUQGsOT36H6Bvvy5w.D-Om63et1DE6qXBbDvSbsG9A-nw_jL29edAzRc74M7ELpS5am1meqsbNXr5eNhVjQip3H0dRWS9gyIua1h6SVxVPd8X-4BcV4K4RXwnzhEc.1565175346779.900000.4UB0eoITG2We5EDID3nrODqlVqqSzuV72tiJXuzreDg;'
                                )
                                .then(response => {
                                    expect(response.res.text).toBe(
                                        'Found. Redirecting to /apply/confirmation'
                                    );
                                })
                        );
                    });
                });
                describe('404', () => {
                    beforeAll(() => {
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
                    });
                    it('Should fail gracefully', () => {
                        agent = request.agent(app);
                        return agent.get('/apply/').then(() =>
                            agent
                                .post('/apply/submission/confirm')
                                .set(
                                    'Cookie',
                                    'cicaSession=mzBCUTUQGsOT36H6Bvvy5w.D-Om63et1DE6qXBbDvSbsG9A-nw_jL29edAzRc74M7ELpS5am1meqsbNXr5eNhVjQip3H0dRWS9gyIua1h6SVxVPd8X-4BcV4K4RXwnzhEc.1565175346779.900000.4UB0eoITG2We5EDID3nrODqlVqqSzuV72tiJXuzreDg;'
                                )
                                .then(response => {
                                    expect(response.statusCode).toBe(404);
                                })
                        );
                    });
                });
                describe('503', () => {
                    beforeAll(() => {
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
                    });
                    it('Should throw a 504 if the service times out', () => {
                        agent = request.agent(app);
                        return agent.get('/apply/').then(() =>
                            agent
                                .post('/apply/submission/confirm')
                                .set(
                                    'Cookie',
                                    'cicaSession=mzBCUTUQGsOT36H6Bvvy5w.D-Om63et1DE6qXBbDvSbsG9A-nw_jL29edAzRc74M7ELpS5am1meqsbNXr5eNhVjQip3H0dRWS9gyIua1h6SVxVPd8X-4BcV4K4RXwnzhEc.1565175346779.900000.4UB0eoITG2We5EDID3nrODqlVqqSzuV72tiJXuzreDg;'
                                )
                                .then(response => {
                                    expect(response.statusCode).toBe(504);
                                })
                        );
                    });
                });
            });
        });
    });
});
