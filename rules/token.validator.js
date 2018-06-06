exports.config = {
  type: "token",
  priority: 80,
  handler: function (req) {
    return (req.headers["Authorization"] ? true : false);
  }
};
