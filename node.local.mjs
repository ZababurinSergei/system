// https://www.typescriptlang.org/docs/handbook/jsx.html
// For troubleshooting, set the log level to DiagLogLevel.DEBUG
import path from "path";
let __dirname = path.dirname(process.argv[1]);
import express from "express";
import cors from "cors";
import Enqueue from "express-enqueue";
import compression from "compression";
import proxy from "express-http-proxy";
import * as dotenv from 'dotenv'
import JiraApi from 'jira-client';
// import promBundle from 'express-prom-bundle';
// import createMetricsPlugin from 'apollo-metrics';
// import { register } from "prom-client";
dotenv.config()

let whitelist = ['http://localhost:3000', 'http://localhost:9876','https://web3-monopoly.web.app','http://localhost:8886','https://zababurinsv.github.io','https://zababurinsv.github.io/monopoly/','http://localhost:8887','http://localhost:8888','http://localhost:6040','https://xart-3e938.firebaseapp.com','https://xart-3e938.web.app','https://universitykids.ru','https://vashi-faili.web.app','https://vashi-faili.web.app',  'https://www.universitykids.ru', 'https://tuning-fork.firebaseapp.com','http://localhost:8888','https://jainagul-tezekbaeva.firebaseapp.com','https://tezekbaeva.firebaseapp.com','http://localhost:6112']

let app = express();

// const aggregatorRegistry = new AggregatorRegistry();
// register for prometheus aggregation
// app.get('/metrics', async (_, res) => {
//     const metrics = await getAggregateMetrics();
//     res.set('Content-Type', aggregatorRegistry.contentType);
//     res.send(metrics.metrics());
// });
// metrics for graphql requests
// const apolloMetricsPlugin = createMetricsPlugin(register);
// metrics for rest requests
// app.use(
//     promBundle({
//         autoregister: false, // disable /metrics for single workers
//         includeMethod: true,
//         includeStatusCode: true,
//         includePath: true,
//         promRegistry: register,
//     }),
// );
app.use(compression())

const jira = new JiraApi({
    protocol: process.env.JIRA_protocol,
    host: process.env.JIRA_host,
    username: process.env.JIRA_username,
    password: process.env.JIRA_password,
    apiVersion: process.env.JIRA_apiVersion,
    strictSSL: process.env.JIRA_strictSSL
});

const queue = new Enqueue({
    concurrentWorkers: 4,
    maxSize: 200,
    timeout: 30000
});

console.log('__dirname', __dirname)

app.use(await cors({ credentials: true }));
app.use(queue.getMiddleware());

app.use((req, res, next) => {
    // console.log(`node: 'icd-11': ${req.method}: ${req.path}`);
    next();
});

let corsOptions = {
    origin: function (origin, callback) {
        console.log('origin', origin)
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

// app.use(proxy('https://mkb11-compose-dev.digitalms.ru', {
//     limit: '5mb',
//     filter: function(req) {
//         const data = ['/v1/'].some(path => req.path.includes(path))
//         return data
//     }
// }));

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

app.get("/rolldice", (req, res) => {
    res.send(getRandomNumber(1, 6).toString());
});


app.use(proxy('http://svc-fer-dev.helpms.ru:3333', {
    limit: '5mb',
    filter: function(req) {
        const data = ['/v1/'].some(path => req.path.startsWith(path))
        if(data) {
            console.log('ddddddddddd', req.path)
        }
        return data
    }
}));

// app.use(proxy('http://localhost', {
//     limit: '5mb',
//     filter: function(req) {
//         const data = ['/v1/'].some(path => req.path.includes(path))
//         return true
//     }
// }));

app.use(proxy('localhost:8080', {
    limit: '5mb',
    filter: function(req) {
        const data = ['/code/'].some(path => req.path.includes(path))
        return data
    }
}));

if(process.env.SANDBOX === 'true') {
    app.use('/', express.static(`${__dirname}/_sandbox/welcomebook/src`));
    app.use('/rules', express.static(`${__dirname}/_sandbox/rules/src`));
} else {
    // app.use('/welcomebook', express.static(`${__dirname}/services/welcomebook/this`));
    app.use('/rules', express.static(`${__dirname}/services/rules/src`));
    app.use('/welcomebook', express.static(`${__dirname}/services/welcomebook/src`));
}

app.use('/template',express.static(`${__dirname}/template`));
app.use(express.static(`${__dirname}/docs`));
app.use('/services',express.static(`${__dirname}/services`));


// app.get(`/welcomebook/*`, async (req, res) => {
//     res.status(200).sendFile(path.join(__dirname, '/services/welcomebook/examples/v2.29.2.html'));
// })

// app.use(express.static(`${__dirname}/services/welcomebook/src`));

app.get(`/*`, async (req, res) => {
    // console.log('index ----- index', __dirname)
    res.status(200).sendFile(path.join(__dirname, '/docs/index.html'));
})

//https://jira-node.github.io/class/src/jira.js~JiraApi.html
//https://jira-node.github.io/file/src/jira.js.html#lineNumber22
app.post(`/project`, async (req, res) => {
    try {
        const project = await jira.getProject('MKB11')
        // const issue = await jira.findIssue(10);
        // console.log(`Status: ${issue.fields.status.name}`);
        console.log('========= JIRA =========', project)
        res.status(200).send(project);
    } catch (err) {
        console.error(err);
        res.status(400).send(err);
    }
})

app.use(queue.getErrorMiddleware())

const port = (process.env.PORT)
    ? process.env.PORT
    : 3001
app.listen(port ,() => {
    console.log('pid: ', process.pid)
    console.log('listening on http://localhost:'+ port);
});