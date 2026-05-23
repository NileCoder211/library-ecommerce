import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import User from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,

      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      callbackURL: process.env.SERVER_URL + "/api/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, cb) => {
  try {
    const email = profile.emails[0].value;

    let user = await User.findOne({ email });

    // Existing account
    if (user) {

      // Link Google account if not linked
      if (!user.googleId) {
        user.googleId = profile.id;

        user.authProvider = "google";

        user.profilePicture =
          profile.photos[0].value;

        await user.save();
      }

      return cb(null, user);
    }

    // Create new user
    user = await User.create({
      googleId: profile.id,

      name: profile.displayName,

      email,

      profilePicture: profile.photos[0].value,

      authProvider: "google",
    });

    return cb(null, user);

  } catch (err) {
    return cb(err, null);
  }
}
  )
);

export default passport;
