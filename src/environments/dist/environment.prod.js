"use strict";
exports.__esModule = true;
exports.environment = exports.env = void 0;
exports.env = {
    protocol: 'https',
    domain: 'fernandezlucena.es',
    app: 'restaurante.'
};
exports.environment = {
    production: true,
    serverSsrPort: 8074,
    domain: "" + exports.env.domain,
    domainUrl: exports.env.protocol + "://" + exports.env.app + exports.env.domain,
    urlEndPoint: exports.env.protocol + "://" + exports.env.app + exports.env.domain + ":8084",
    googleAnalyticsId: '8SCFLYHJBQ'
    // domain: 'restaurante.fernandezlucena.es',
    // urlEndPoint: 'https://restaurante-back.fernandezlucena.es:8084'
};
