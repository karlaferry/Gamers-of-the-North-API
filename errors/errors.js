exports.handle404 = (err, req, res, next) => {
  if (err.statusCode === 404) {
    res.status(404).send("Page not found.");
  }
  next(err);
};

exports.customErrorHandling = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.handle500 = (err, req, res, next) => {
  if (err.statusCode === 500) {
    res.status(500).send("Internal Server Error");
  }
};
