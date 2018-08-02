import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  GET_MANY_REFERENCE,
  CREATE,
  UPDATE,
  DELETE,
  DELETE_MANY,
  fetchUtils
} from 'react-admin';
import { stringify } from 'query-string';

/**
 * Maps react-admin queries to Comp Handler REST API
 *
 * @param {string} type Request type, e.g GET_LIST
 * @param {string} resource Resource name, e.g. "posts"
 * @param {Object} payload Request parameters. Depends on the request type
 * @returns {Promise} the Promise for a data response
 * @example
 * GET_LIST     => GET /{resource}?sort=['title','ASC']&range=[0, 24]
 * GET_ONE      => GET /{resource}/123
 * GET_MANY     => GET /{resource}/search?title=test
 * UPDATE       => PUT /{resource}/123
 * CREATE       => POST /{resource}/123
 * DELETE       => DELETE /{resource}/123
 */
export default (apiUrl, httpClient = fetchUtils.fetchJson) => {
  /**
   * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
   * @param {String} resource Name of the resource to fetch, e.g. 'posts'
   * @param {Object} params The data request params, depending on the type
   * @returns {Object} { url, options } The HTTP request parameters
   */
  const convertDataRequestToHTTP = (type, resource, params) => {
    let url = '';
    const options = {};

    switch (type) {
      case GET_LIST: {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const query = {
          sort: JSON.stringify([field, order]),
          filter: JSON.stringify(params.filter),
          perPage,
          page
        };

        url = `${apiUrl}/${resource}?${stringify(query)}`;
        break;
      }

      case GET_ONE:
        url = `${apiUrl}/${resource}/${params.id}`;
        break;

      case GET_MANY: {
        const query = {
          filter: JSON.stringify(params.ids)
        };
        url = `${apiUrl}/${resource}?${stringify(query)}`;
        break;
      }

      case GET_MANY_REFERENCE: {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        const query = {
          sort: JSON.stringify([field, order]),
          filter: JSON.stringify({
            ...params.filter,
            [params.target]: params.id
          }),
          perPage,
          page
        };
        url = `${apiUrl}/${resource}?${stringify(query)}`;
        break;
      }

      case UPDATE:
        url = `${apiUrl}/${resource}/${params.id}`;
        options.method = 'PUT';
        options.body = JSON.stringify(params.data);
        break;

      case CREATE:
        url = `${apiUrl}/${resource}/create`;
        options.method = 'POST';
        options.body = JSON.stringify(params.data);
        break;

      case DELETE:
        url = `${apiUrl}/${resource}/${params.id}`;
        options.method = 'DELETE';
        break;

      case DELETE_MANY: {
        const query = {
          filter: JSON.stringify({
            id: params.ids
          })
        };
        url = `${apiUrl}/${resource}/many?${stringify(query)}`;
        options.method = 'DELETE';
        break;
      }
      default:
        throw new Error(`Unsupported fetch action type ${type}`);
    }
    return {
      url,
      options
    };
  };

  /**
   * @param {Object} response HTTP response from fetch()
   * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
   * @param {String} resource Name of the resource to fetch, e.g. 'posts'
   * @param {Object} params The data request params, depending on the type
   * @returns {Object} Data response
   */
  const convertHTTPResponse = (response, type, resource, params) => {
    const { headers, json } = response;

    if (response.status == 204) {
      return {
        data: [],
        total: 0
      };
    }

    switch (type) {
      case GET_LIST: {
        const response = json
          ? {
              data: json.results,
              total: json.total
            }
          : {
              data: [],
              total: 0
            };

        return response;
      }

      case CREATE:
        return {
          data: {
            ...params.data,
            id: json.results.id
          }
        };

      case UPDATE:
        return {
          data: 'Successful'
        };

      case DELETE:
        return {
          data: 'Successful'
        };

      case DELETE_MANY:
        return {
          data: 'Successful'
        };

      default:
        return {
          data: json.results
        };
    }
  };

  /**
   * @param {string} type Request type, e.g GET_LIST
   * @param {string} resource Resource name, e.g. "posts"
   * @param {Object} payload Request parameters. Depends on the request type
   * @returns {Promise} the Promise for a data response
   */
  return (type, resource, params) => {
    const { url, options } = convertDataRequestToHTTP(type, resource, params);

    return httpClient(url, options).then(response =>
      convertHTTPResponse(response, type, resource, params)
    );
  };
};
