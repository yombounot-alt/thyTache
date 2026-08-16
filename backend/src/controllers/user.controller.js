const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const userService = require('../services/user.service');
const { toPublicUser } = require('../utils/publicUser');

const listUsers = catchAsync(async (req, res) => {
  const users = await userService.listUsers();
  sendSuccess(res, { data: users.map(toPublicUser) });
});

module.exports = { listUsers };
