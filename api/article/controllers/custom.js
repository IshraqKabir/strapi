const moment = require("moment");

module.exports = {
  async find(ctx) {
    // getting the query params
    let { from, to } = ctx.query;

    // querying the articles according to the dates
    const articles = await strapi
      .query("article")
      .find({ last_post_date_gte: from, last_post_date_lte: to, _limit: -1 });

    // converting the date to date objects for calculation
    from = moment(from);
    to = moment(to);

    let yearly = false,
      monthly = false;

    if (to.diff(from, "year") > 0) {
      yearly = true;
      monthly = false;
    } else if (to.diff(from, "month") > 0) {
      monthly = true;
      yearly = false;
    }

    let dates = [];

    // getting list of unique dates
    articles.map((article) => {
      // refactoringi the article date
      let articleDate = article.last_post_date;

      if (yearly) {
        // will return the year of the date
        articleDate = moment(articleDate).year();
      } else if (monthly) {
        // will return the month of the date
        articleDate = moment(articleDate).format("MMMM");
      }

      if (!dates.includes(articleDate)) {
        dates.push(articleDate);
      }
    });

    // getting article counts of each dates
    let result = dates.map((date) => {
      let count = 0;

      // mapping through the articles if date matches
      // if it matches count is increased;
      articles.map((article) => {
        let articleDate = article.last_post_date;
        if (yearly) {
          articleDate = moment(articleDate).year();
        } else if (monthly) {
          articleDate = moment(articleDate).format("MMMM");
        }

        if (articleDate == date) {
          count++;
        }
      });

      return {
        last_post_date: date,
        count,
      };
    });

    ctx.send(result);
  },
};
