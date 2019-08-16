'use strict';

const express = require('express');
const formHelper = require('./form-helper');
const qService = require('./questionnaire-service')();

const router = express.Router();

router.route('/').get(async (req, res, next) => {
    try {
        const response = await qService.getCurrentSection(req.cicaSession.questionnaireId);
        console.log(
            `22222222222222222222222222222222222222222 RESPONSE GOES HERE: ${JSON.stringify(
                response,
                null,
                4
            )}`
        );
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
        console.log(response.body);
        const {previousSectionId} = response.body.data[0].attributes.sectionId;
        if (response.body.links.prev) {
            const overwriteId = response.body.links.prev;
            if (overwriteId.startsWith('http')) {
                return res.redirect(previousSectionId);
            }
            return res.redirect(`/${previousSectionId}`);
        }
        const prev = `${req.baseUrl}/${previousSectionId}`;
        return res.redirect(prev);
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
            const html = formHelper.getSectionHtml(response.body);
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
            const response = await qService.postSection(
                req.cicaSession.questionnaireId,
                sectionId,
                body
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
                const html = formHelper.getSectionHtmlWithErrors(response.body, body, sectionId);
                res.send(html);
            }
        } catch (err) {
            res.status(err.statusCode || 404).render('404.njk');
            next(err);
        }
    });

router.route('/submission/confirm').post(async (req, res, next) => {
    try {
        await qService.postSubmission(req.cicaSession.questionnaireId);
        const response = await qService.getSubmissionStatus(
            req.cicaSession.questionnaireId,
            Date.now()
        );
        if (response.submitted) {
            return res.redirect('/apply/confirmation');
        }
        const err = Error(`The service is currently unavailable`);
        err.name = 'HTTPError';
        err.statusCode = 503;
        err.error = '503 Service unavailable';
        res.status(err.statusCode).render('503.njk');
        return next(err);
    } catch (err) {
        res.status(err.statusCode || 404).render('404.njk');
        return next(err);
    }
});

module.exports = router;
