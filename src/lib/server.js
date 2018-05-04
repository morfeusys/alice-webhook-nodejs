'use strict';

const http = require('http');
const hook = require("../lib");

const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

http.createServer((req, res) => {
    res.on('error', (err) => {
        console.error(err);
    });

    if (req.url === '/setup') {
        res.writeHead(301,
            {
                "Location": 'http://localhost:8080/dashboard/setup/webhook',
                "Referer": req.hostname
            }
        );
        res.end();
    } else if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Webhook supports only a POST requests');
    } else {
        let body = [];

        req.on('data', (chunk) => {
            body.push(chunk);

        }).on('end', () => {
            var request = JSON.parse(Buffer.concat(body).toString());
            hook(request).then((response) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(response));
            }, () => {
                res.statusCode = 500;
                res.end();
            });

        }).on('error', (err) => {
            console.error(err);
            res.statusCode = 400;
            res.end();
        });

    }

}).listen(port, hostname, () => {
    console.log(`Webhook running at http://${hostname}:${port}`);
});