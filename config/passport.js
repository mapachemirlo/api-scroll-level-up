const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

module.exports = (passport) => {
  
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/auth/github/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      if (!user) {
        user = await User.create({ githubId: profile.id, name: profile.displayName, email: profile.emails[0].value });
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
  });
};
