class apiFeatures {
    constructor(query, queryString) {
        //where query is the data or object from DB.
        //Query String is the query used for making sense for this data like filter and either
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        //1A)  filtering
        const queryObj = { ...this.queryString };
        const execludedFeilds = ['sort', 'limit', 'page', 'feilds'];
        execludedFeilds.forEach(item => delete queryObj[item]);
        let query = '';
        //1B) Advanced Filtering
        if (this.queryString) {

            query = JSON.parse(JSON.stringify(queryObj).replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`));
        }
        this.query.find(query);
        return this;//for chaining
    }
    sort() {
        if (this.queryString.sort) {
            this.query.sort(this.queryString.sort.split(',').join(' '));
        } else {
            this.query.sort('-createdAt')
        }
        return this;
    }
    feildLimit() {
        if (this.queryString.feilds) {
            this.query.select(this.queryString.feilds.split(',').join(' '));
        } else {
            this.query.select('-__v');
        }
        return this;
    }
    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        let skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        // if (this.queryString.page) {
        //     const numTours = this.query.countDocuments();
        //     console.log(numTours);
        //     if (skip > numTours)
        //         throw new Error('Page Doesnot Exist!');
        // }
        return this;
    }

}
module.exports = apiFeatures;