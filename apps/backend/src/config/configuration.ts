export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL || '',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  spektrum: {
    apiKey: process.env.SPEKTRUM_API_KEY || '',
    endpoint: process.env.SPEKTRUM_ENDPOINT || 'https://platform.jigjoy.ai',
  },
});
