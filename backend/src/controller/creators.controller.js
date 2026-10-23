import redis from "../config/redis.js";
import { findUserByUsername } from "../DAO/user.dao.js";
import { supportModel } from "../models/support.model.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Maps a user document to its public representation.
 * @param {User} user
 * @returns {PublicUser}
 */
function toPublicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Updates the authenticated creator's profile.
 * @route PATCH /api/v1/creators/me
 * @access Private
 * @returns {Promise<void>}
 */
export const updateCreator = asyncHandler(async (req, res) => {
  const user = req.user;
  const { name, bio, avatarUrl, coffeePrice } = req.body;

  if (name) user.name = name;
  if (bio) user.bio = bio;
  if (avatarUrl) user.avatarUrl = avatarUrl;
  if (coffeePrice) user.coffeePrice = coffeePrice;

  await user.save();

  await redis.del(`creator:${user.username}:page`);

  sendSuccess(res, 200, "Creator updated successfully", {
    user: toPublicUser(user),
  });
});

export const getCreatorByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const cacheKey = `creator:${username}:page`;

  const cached = await redis.get(cacheKey);

  if (cached) {
    res.set("X-Cache", "HIT");

    return sendSuccess(res, 200, "Creator found", JSON.parse(cached));
  }

  res.set("X-Cache", "MISS");

  const user = await findUserByUsername(username);
  if (!user) {
    return sendSuccess(res, 404, "Creator not found", null);
  }

  const result = await supportModel.aggregate([
    {
      $match: {
        creatorId: user._id,
        status: "paid",
      },
    },
    {
      $group: {
        _id: null,
        totalCoffees: { $sum: "$coffees" },
        supporterCount: { $sum: 1 },
      },
    },
  ]);

  const { totalCoffees = 0, supporterCount = 0 } = result[0] || {};

  const recentSupports = await supportModel.aggregate([
    {
      $match: {
        creatorId: user._id,
        status: "paid",
      },
    },
    {
      $sort: { paidAt: -1 },
    },
    {
      $limit: 10,
    },
    {
      $project: {
        _id: 0,
        supporterName: 1,
        message: 1,
        coffees: 1,
        paidAt: 1,
      },
    },
  ]);

  const data = {
    creator: {
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      coffeePrice: user.coffeePrice,
    },
    stats: {
      totalCoffees,
      supporterCount,
    },
    recentSupports,
  };

  await redis.set(cacheKey, JSON.stringify(data), "EX", 300);

  sendSuccess(res, 200, "Creator found", data);
});

export const getCreatorLeaderboard = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const cacheKey = `creator:${username}:leaderboard`;

  const cached = await redis.get(cacheKey);

  if (cached) {
    res.set("X-Cache", "HIT");

    return sendSuccess(res, 200, "Leaderboard fetched successfully", JSON.parse(cached));
  }

  res.set("X-Cache", "MISS");

  const user = await findUserByUsername(username);
  if (!user) {
    return sendSuccess(res, 404, "Creator not found", null);
  }

  const leaderboard = await supportModel.aggregate([
    {
      $match: {
        creatorId: user._id,
        status: "paid",
      },
    },
    {
      $group: {
        _id: "$supporterEmail",
        name: { $first: "$supporterName" },
        coffees: { $sum: "$coffees" },
      }
    },
    {
      $sort: { coffees: -1 }
    },
    {
      $limit: 10
    },
    {
      $project: {
        _id: 0,
        name: 1,
        coffees: 1
      }
    }
  ]);

  await redis.set(cacheKey, JSON.stringify(leaderboard), "EX", 300);

  sendSuccess(res, 200, "Leaderboard fetched successfully", leaderboard);
});