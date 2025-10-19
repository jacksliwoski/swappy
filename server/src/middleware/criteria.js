// Example criteria middleware (age, price, etc.) — easily extendable
module.exports = function criteria(req, res, next) {
  // placeholder; always allows for now
  next();
};
