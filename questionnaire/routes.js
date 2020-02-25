'use strict';

const express = require('express');
const formHelper = require('./form-helper');
const qService = require('./questionnaire-service')();

const router = express.Router();

router.route('/').get(async (req, res, next) => {
    try {
        const response = await qService.getFirstSection(req.cicaSession.questionnaireId);
        const responseBody = response.body;
        const initialSection = formHelper.removeSectionIdPrefix(
            responseBody.data[0].attributes.sectionId
        );
        res.redirect(`${req.baseUrl}/${initialSection}`);
    } catch (err) {
        res.status(err.statusCode || 404).render('404.njk');
        next(err);
    }
});

router.route('/previous/:section').get(async (req, res, next) => {
    try {
        const sectionId = formHelper.addPrefix(req.params.section);
        const response = await qService.getPrevious(req.cicaSession.questionnaireId, sectionId);
        if (response.body.data[0].attributes && response.body.data[0].attributes.url !== null) {
            const overwriteId = response.body.data[0].attributes.url;
            return res.redirect(overwriteId);
        }
        const previousSectionId = formHelper.removeSectionIdPrefix(
            response.body.data[0].attributes.sectionId
        );
        return res.redirect(`${req.baseUrl}/${previousSectionId}`);
    } catch (err) {
        res.status(err.statusCode || 404).render('404.njk');
        return next(err);
    }
});

router
    .route('/:section')
    .get(async (req, res, next) => {
        try {
            let answers = {};
            const sectionId = formHelper.addPrefix(req.params.section);
            const response = await qService.getSection(req.cicaSession.questionnaireId, sectionId);
            if (
                response.body.data &&
                response.body.data[0].attributes.sectionId === response.body.meta.summary
            ) {
                answers = await qService.getAnswers(req.cicaSession.questionnaireId);
            }
            const html = formHelper.getSectionHtml(
                response.body,
                answers,
                req.csrfToken(),
                res.locals.nonce
            );
            res.send(html);
        } catch (err) {
            res.status(err.statusCode || 404).render('404.njk');
            next(err);
        }
    })
    .post(async (req, res, next) => {
        try {
            console.log(JSON.stringify(req.body, null, 4));
            const sectionId = formHelper.addPrefix(req.params.section);
            const body = formHelper.processRequest(req.body, req.params.section);
            // delete the token from the body to allow AJV to validate the request.
            // eslint-disable-next-line no-underscore-dangle
            delete body._csrf;
            const response = await qService.postSection(
                req.cicaSession.questionnaireId,
                sectionId,
                body
            );
            if (response.statusCode === 201) {
                // is there a forced redirect
                if ('next' in req.query) {
                    const progressEntryResponse = await qService.getSection(
                        req.cicaSession.questionnaireId,
                        formHelper.addPrefix(req.query.next)
                    );

                    if (progressEntryResponse.statusCode === 200) {
                        const nextSectionId = formHelper.removeSectionIdPrefix(
                            progressEntryResponse.body.data[0].attributes.sectionId
                        );

                        return res.redirect(`${req.baseUrl}/${nextSectionId}`);
                    }
                }

                const progressEntryResponse = await qService.getCurrentSection(
                    req.cicaSession.questionnaireId
                );
                const nextSectionId = formHelper.removeSectionIdPrefix(
                    progressEntryResponse.body.data[0].attributes.sectionId
                );
                return res.redirect(`${req.baseUrl}/${nextSectionId}`);
            }

            const html = formHelper.getSectionHtmlWithErrors(
                response.body,
                sectionId,
                req.csrfToken(),
                res.locals.nonce
            );
            return res.send(html);
        } catch (err) {
            res.status(err.statusCode || 404).render('404.njk');
            return next(err);
        }
    });

router.route('/submission/confirm').post(async (req, res, next) => {
    try {
        await qService.postSubmission(req.cicaSession.questionnaireId);
        const response = await qService.getSubmissionStatus(
            req.cicaSession.questionnaireId,
            Date.now()
        );

        if (response.status === 'FAILED') {
            const err = Error(`Unable to retrieve questionnaire submission status`);
            err.name = 'CRNNotRetrieved';
            err.statusCode = 500;
            err.error = '500 Internal Server Error';
            throw err;
        }

        const resp = await qService.getCurrentSection(req.cicaSession.questionnaireId);
        const responseBody = resp.body;
        const nextSection = formHelper.removeSectionIdPrefix(
            responseBody.data[0].attributes.sectionId
        );
        return res.redirect(`${req.baseUrl}/${nextSection}`);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
