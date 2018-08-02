var config = {
  production: {
    api_url: 'https://subs.aceville.com/api'
  },
  default: {
    api_url: 'http://127.0.0.1:3000'
  },
  development: {
    api_url: 'http://127.0.0.1:3000'
  }
};

const env = process.env.REACT_APP_STAGE
  ? process.env.REACT_APP_STAGE
  : 'developement';

export default config[env];
