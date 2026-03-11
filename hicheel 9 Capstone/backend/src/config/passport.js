const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const prisma = require("../prisma/client");

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.GOOGLE_CALLBACK_URL;

if (clientID && clientSecret && callbackURL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const provider = "GOOGLE";
          const providerAccountId = profile.id;
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const name = profile.displayName || "Google User";

          if (!providerAccountId || !email) {
            return done(new Error("Google profile is missing required fields"));
          }

          const existingOAuth = await prisma.oAuthAccount.findUnique({
            where: {
              provider_providerAccountId: {
                provider,
                providerAccountId,
              },
            },
            include: { user: true },
          });
n
          if (existingOAuth?.user) {
            return done(null, existingOAuth.user);
          }

          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                name,
                email,
                role: "CUSTOMER",
                provider: "GOOGLE",
              },
            });
          } else if (user.provider !== "GOOGLE") {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { provider: "GOOGLE" },
            });
          }

          await prisma.oAuthAccount.upsert({
            where: {
              provider_providerAccountId: {
                provider,
                providerAccountId,
              },
            },
            update: {
              accessToken: accessToken || null,
              refreshToken: refreshToken || null,
            },
            create: {
              userId: user.id,
              provider,
              providerAccountId,
              accessToken: accessToken || null,
              refreshToken: refreshToken || null,
            },
          });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );
}

module.exports = passport;

