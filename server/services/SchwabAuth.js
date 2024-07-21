const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { URLSearchParams } = require('url');

// Load configuration
const configFilePath = path.join(__dirname, '..', 'config', 'config.json');
const { appKey, secret, redirectUrl } = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

class SchwabAuth {
    constructor() {
        if (!SchwabAuth.instance) {
            this.appKey = appKey;
            this.secret = secret;
            this.redirectUrl = redirectUrl;
            SchwabAuth.instance = this;
        }
        return SchwabAuth.instance;
    }

    static extractAuthorizationCode(authCodeResUrl) {
        const parsedUrl = new URL(authCodeResUrl);
        const csCode = parsedUrl.searchParams.get('code');

        if (!csCode) {
            throw new Error('Authorization code not found in the URL.');
        }

        return csCode;
    }

    getSavedRefreshToken() {
        const isProd = process.env.NODE_ENV === 'production';
        let refresh_token;
        if(isProd) {
            refresh_token = process.env.refresh_token;
        }
        if(!refresh_token) {
            const authData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'auth.json'), 'utf8'));
            refresh_token = authData.refresh_token;
        }
        return refresh_token;
    }

    async saveRefreshToken(refreshToken, filePath) {
        const isProd = process.env.NODE_ENV === 'production';
        if(isProd) {
            process.env.refresh_token = refreshToken;
        } else {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, JSON.stringify({
                refresh_token: refreshToken
            }, null, 2));
            console.log('Refresh token saved to', filePath);
        }
    }
    
    async generateTokens(authCodeResUrl) {
        const csCode = SchwabAuth.extractAuthorizationCode(authCodeResUrl)
        const tokenUrl = 'https://api.schwabapi.com/v1/oauth/token';
        const payload = new URLSearchParams({
            grant_type: 'authorization_code',
            code: csCode,
            redirect_uri: this.redirectUrl
        });

        let authHeader = Buffer.from(`${this.appKey}:${this.secret}`).toString('base64');
        while (authHeader.length % 4 !== 0) {
            authHeader += '=';
        }

        try {
            const response = await axios.post(tokenUrl, payload.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${authHeader}`
                }
            });

            const tokens = response.data;
            await this.saveRefreshToken(tokens.refresh_token, path.join(__dirname, '..', 'config', 'auth.json'));

            return tokens.refresh_token;
        } catch (error) {
            console.error('Error generating tokens:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async fetchNewAccessToken(refreshToken) {
        const tokenUrl = 'https://api.schwabapi.com/v1/oauth/token';
        const payload = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        });

        let authHeader = Buffer.from(`${this.appKey}:${this.secret}`).toString('base64');
        while (authHeader.length % 4 !== 0) {
            authHeader += '=';
        }

        try {
            const response = await axios.post(tokenUrl, payload.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${authHeader}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching access token:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async getAccessToken() {
        try {
            const refreshToken = this.getSavedRefreshToken();
            const tokens = await this.fetchNewAccessToken(refreshToken);
            return tokens.access_token;
        } catch (error) {
            console.error('Error in getAccessToken:', error);
            throw error;
        }
    }
}

const instance = new SchwabAuth();
Object.freeze(instance);

module.exports = instance;
