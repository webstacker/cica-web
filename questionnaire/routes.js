'use strict';

const express = require('express');
const formHelper = require('./form-helper');
const qService = require('./questionnaire-service')();

const router = express.Router();

router.route('/').get(async (req, res, next) => {
    try {
        const response = await qService.getCurrentSection(req.cicaSession.questionnaireId);
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
            const sectionId = formHelper.addPrefix(req.params.section);
            const response = await qService.getSection(req.cicaSession.questionnaireId, sectionId);
            const html = formHelper.getSectionHtml(response.body, req.csrfToken());
            res.send(html);
        } catch (err) {
            res.status(err.statusCode || 404).render('404.njk');
            next(err);
        }
    })
    .post(async (req, res, next) => {
        try {
            const sectionId = formHelper.addPrefix(req.params.section);
            const body = formHelper.processRequest(req.body, req.params.section);
            // cache the token for posting to the DCS.
            // eslint-disable-next-line no-underscore-dangle
            const csrf = body._csrf;
            // delete the token from the body to allow AJV to validate the request.
            // eslint-disable-next-line no-underscore-dangle
            delete body._csrf;
            const response = await qService.postSection(
                req.cicaSession.questionnaireId,
                sectionId,
                body,
                csrf
            );
            if (response.body.data) {
                const progressEntry = await qService.getCurrentSection(
                    req.cicaSession.questionnaireId
                );
                const nextSectionId = formHelper.removeSectionIdPrefix(
                    progressEntry.body.data[0].attributes.sectionId
                );
                const nextSection = formHelper.getNextSection(nextSectionId, req.query.redirect);
                res.redirect(`${req.baseUrl}/${nextSection}`);
            } else {
                const html = formHelper.getSectionHtmlWithErrors(
                    response.body,
                    body,
                    sectionId,
                    req.csrfToken()
                );
                res.send(html);
            }
        } catch (err) {
            res.status(err.statusCode || 404).render('404.njk');
            next(err);
        }
    });

router.route('/submission/confirm').post(async (req, res, next) => {
    try {
        await qService.postSubmission(req.cicaSession.questionnaireId, req.cicaSession.csrfSecret);
        const response = await qService.getSubmissionStatus(
            req.cicaSession.questionnaireId,
            Date.now()
        );
        if (response.status !== 'FAILED') {
            return res.redirect('/apply/confirmation');
        }
        const err = Error(`The service is currently unavailable`);
        err.name = 'HTTPError';
        err.statusCode = 503;
        err.error = '503 Service unavailable';
        res.status(err.statusCode).render('503.njk');
        return next(err);
    } catch (err) {
        res.status(err.statusCode || 404).render('503.njk');
        return next(err);
    }
});

module.exports = router;
