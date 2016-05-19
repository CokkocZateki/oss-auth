Accounts.validateNewUser(function (user) {
  return user.username.toLowerCase() !== "root";
});

Accounts.validateNewUser(function (user) {
  return user.username.toLowerCase() !== "skynet";
});

Accounts.validateLoginAttempt(function (attempt) {
//  console.log("validateLoginAttempt", attempt, attempt.user.active);
  return attempt.allowed && attempt.user.active;
});

Accounts.onCreateUser(function(options, user) {
  user.usernameNormalized=user.username.toLowerCase().replace("'","").replace(/ /g,"_");
  // We still want the default hook's 'profile' behavior.
  if (options.profile)
    user.profile = options.profile;
  return user;
});