module.exports = {
    handleError: (res, err) => {
        console.log(err)
        return res.status(400).json({
            message: 'Something went wrong, please try again.',
            errors: err
        });
    },

    unauthorized: (res, message, errors = null) => {
        return res.status(401).json({
            message, errors
        });
    },

    error: (res, message, errors = null) => {
        return res.status(400).json({
            message, errors
        });
    },

    success: (res, data, message = '') => {
        return res.status(200).json({
            message, data
        });
    },

    successExcelFile(res, fileWritter) {
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        return fileWritter.write(res)
            .then(function () {
                res.status(200).end();
            });
    },

    successPDFFile(res, data, name) {
        res.attachment(name + '.pdf');
        return res.end(data);
    }
};