import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR, AUTH_CHECK } from 'react-admin';
import axios from 'axios';
import config from '../config';

export default (type, params) => {
  // called when the user attempts to log in
  if (type === AUTH_LOGIN) {
    const { username, password } = params;
    const url = `${config.api_url}/staff/login`;
    return axios
      .post(url, { username, password })
      .then(results => {
        localStorage.setItem('token', results.data.token);
        // return Promise.resolve();
        return results;
      })
      .catch(error => {
        throw new Error(error.response.data.error.message);
      });

    return Promise.resolve();
  }
  // called when the user clicks on the logout button
  if (type === AUTH_LOGOUT) {
    localStorage.removeItem('token');
    return Promise.resolve();
  }
  // called when the API returns an error
  if (type === AUTH_ERROR) {
    const { status } = params;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      return Promise.reject();
    }
    return Promise.resolve();
  }
  // called when the user navigates to a new location
  if (type === AUTH_CHECK) {
    return localStorage.getItem('token') ? Promise.resolve() : Promise.reject();
  }
  return Promise.reject('Unknown method');
};
