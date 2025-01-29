const { API_STATUS_CODE } = require("../../consts/error-status");

/**
 * @author Md. Majedul Islam,
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Md. Majedul Islam
 * 
 * @description This middleware is used for getting data from database and paginate these data.
 * 
 */
const paginationData = (req, res, next) => {
    const lgKey = req.body.lg;
    const itemsPerPageDefault = 5;
    const currentPageNumberDefault = 0;
    const filterBy = "";
    const sortOrder = "asc";
    const _itemsPerPage = req.body.paginationData.itemsPerPage
    const _currentPageNumber = req.body.paginationData.currentPageNumber
    const _sortOrder = req.body.paginationData.sortOrder;
    const _filterBy = req.body.paginationData.filterBy;
    const errors = [];

    if (isNaN(_itemsPerPage)) {
        errors.push("itemsPerPage must be a integer value")
    }
    if (isNaN(_currentPageNumber)) {
        errors.push("currentPageNumber must be a integer value")
    }
    const itemsPerPage = parseInt(_itemsPerPage);
    const currentPageNumber = parseInt(_currentPageNumber);

    if (itemsPerPage < 0) {
        errors.push("itemsPerPage must be a positive integer value")
    }
    if (currentPageNumber < 0) {
        errors.push("currentPageNumber must be a positive integer value")
    }
    if (_sortOrder !== 'asc' && _sortOrder !== 'desc') {
        errors.push('sortOrder - has to be either asc or desc');
    }
    // console.log('errors: ', errors);
    // return
    if (errors.length >= 1) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'invalid_pagination_data',
                lgKey,
            )
        );
    }

    const paginationData = {
        itemsPerPage: itemsPerPage || itemsPerPageDefault,
        currentPageNumber: currentPageNumber || currentPageNumberDefault,
        filterBy: _filterBy || filterBy,
        sortOrder: _sortOrder || sortOrder
    }
    req.body.paginationData = ({
        ...paginationData,
        offset: paginationData.itemsPerPage * paginationData.currentPageNumber
    });
    // console.log(paginationData);
    next();

}
module.exports = {
    paginationData
}