const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

module.exports = (passport) => {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    //callbackURL: 'http://localhost:3000/auth/github/callback',
    callbackURL: 'https://api-scroll-level-up.vercel.app/auth/github/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      if (!user) {
        user = await User.create({
          githubId: profile.id,
          name: profile.displayName,
          email: profile.emails[0]?.value || '', // para los esquizo como yo que no tienen el mail publico en github
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};



// module.exports = (passport) => {
//   passport.use(new GitHubStrategy({
//     clientID: process.env.GITHUB_CLIENT_ID,
//     clientSecret: process.env.GITHUB_CLIENT_SECRET,
//     //callbackURL: 'https://api-scroll-level-up.vercel.app/auth/github/callback',
//     callbackURL: 'http://localhost:3000/auth/github/callback',
//   }, async (accessToken, refreshToken, profile, done) => {
//     try {
//       let user = await User.findOne({ githubId: profile.id });
//       if (!user) {
//         user = await User.create({ githubId: profile.id, name: profile.displayName, email: profile.emails[0].value });
//       }
//       return done(null, user);
//     } catch (err) {
//       return done(err, false);
//     }
//   }));

//   passport.serializeUser((user, done) => done(null, user.id));
//   passport.deserializeUser((id, done) => {
//     User.findById(id, (err, user) => done(err, user));
//   });
// };


