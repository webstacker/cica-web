'use strict';

const {PassThrough} = require('stream');
const request = require('./request-service')();

function createHelper() {
    async function postFile(questionnaireId, fileName, fileStream, headers) {
        const saveStream = new PassThrough();
        fileStream.pipe(saveStream);
        const url = `http://docker.for.win.localhost:3400/files/${questionnaireId}/${fileName}`;
        const options = {
            url,
            body: saveStream,
            headers: {
                'Content-Type': headers['content-type']
            }
        };
        return request.postFile(options);
    }

    return Object.freeze({
        postFile
    });
}

module.exports = createHelper;
