passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    const user = users.find((user) => user.email === email);
    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }

    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
