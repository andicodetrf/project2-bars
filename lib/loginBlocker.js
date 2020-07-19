module.exports = function(request, response, next) {
    if (!request.user) {
      request.flash("error", "You must be logged in to access that page");
      response.redirect("/auth/login");
    } else {
      next();
    }
  };