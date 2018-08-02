module.exports = {
    /**
     * return successful json response
     * @param {object} res - the response object from express
     * @param {string} message - the success message string
     * @param {object[]=} results - array of objects for chosen results
     * @return {object} - returns a json response object with success boolean, optional message, optional results
     */
    isSuccess: (res, message, results) => {
        let response = {
            success: true,
            message
        };

        if(results){
            if(results.count){
                response.total = results.count;
                response.results = results.rows;
            }else{
                response.results = results;
            }
        }


        let status = res.httpCode || 200;

        return res.status(status)
            .json(response);
    },

    /**
     * return successful json response
     * @param {object} res - the response object from express
     * @param {string} err - the error message string
     * @param {object=} reason - object that explains the error in more detail
     * @return {object} - returns a json response object with success boolean, optional message, optional reason
     */
    isFailure: (res, error, reason) => {
        let response = {
            success: false,
            error,
            reason
        };

        let status = res.httpCode || 400;
        if (status == 404 & !error) {
            response.error = 'Entry Not Found';
        }

        if (status == 500 & !error) {
            response.error = 'Internal Server Error';
        }

        return res.status(status)
            .json(response);
    }
};