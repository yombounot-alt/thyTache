function toPublicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
}

module.exports = { toPublicUser };
