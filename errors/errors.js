exports.handle404 = (err, req, res, next) => {
  if (err.statusCode === 404) {
    res.status(404).send("Page not found.");
  }
};
