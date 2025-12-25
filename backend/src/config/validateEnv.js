export const validateEnv = () => {
    const required = [
        'ACCESS_TOKEN_SECRET',
        'REFRESH_TOKEN_SECRET',
        'MONGODB_URI',
        'PORT',
        'CORS_ORIGIN'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};