
export const env = {
    protocol: 'https',
    domain: 'ajamam.es',
    app: 'restaurante.'
};

export const environment = {
    production: true,

    serverSsrPort: 8074,
    domain: `${env.domain}`,
    domainUrl: `${env.protocol}://${env.app}${env.domain}`,
    urlEndPoint: `${env.protocol}://${env.app}${env.domain}:8084`,
    googleAnalyticsId: '8SCFLYHJBQ'

    // domain: 'restaurante.fernandezlucena.es',
    // urlEndPoint: 'https://restaurante-back.fernandezlucena.es:8084'

};
