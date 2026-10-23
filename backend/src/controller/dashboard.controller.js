import { supportModel } from "../models/support.model.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const data = await supportModel.aggregate([
    { 
        $match: { 
            creatorId: new mongoose.Types.ObjectId(userId),
            status: "paid" 
        } 
    },
    { 
        $group: { 
            _id: null, 
            totalAmount: { $sum: "$amount" },
            totalCoffees: { $sum: "$coffees" },
            totalSupporters: { $sum: 1 },
            uniqueSupporters: { $addToSet: "$supporterEmail" }
        } 
    },
  ]);

  const { totalAmount = 0, totalCoffees = 0, totalSupporters = 0, uniqueSupporters = [] } = data[0] || {};

  const averageCoffees = totalSupporters > 0 ? totalCoffees / totalSupporters : 0;

  sendSuccess(res, 200, "Dashboard summary fetched successfully", {
    totalSupporters,
    totalCoffees,
    totalEarnings: totalAmount/100,
    averageCoffees,
    uniqueSupporters: uniqueSupporters.length,
  });
});

export const getDashboardEarnings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const days = Number(req.query.days ?? 30);

  if (!Number.isInteger(days) || days <= 0 || days > 90) {
    throw new AppError(400, "Invalid 'days' parameter. It should be between 1 and 90.");
  }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const earningsData = await supportModel.aggregate([
        {
            $match: {
                creatorId: new mongoose.Types.ObjectId(userId),
                status: "paid",
                paidAt: { $gte: startDate }
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$paidAt", timezone: "Asia/Kolkata" }
                },
                earnings: { $sum: "$amount" },
                coffees: { $sum: "$coffees" },
                supports: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                date: "$_id",
                earnings: { $divide: ["$earnings", 100] }, // Convert to INR
                coffees: 1,
                supports: 1
            }
        },
        {
            $sort: { date: 1 }
        },

    ]);

    sendSuccess(res, 200, "Dashboard earnings fetched successfully", {
        days,
        data: earningsData
    });
});

export const getTopSupporters = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const limit = Number(req.query.limit ?? 10);

  if (!Number.isInteger(limit) || limit <= 0 || limit > 50) {
    throw new AppError(400, "Invalid 'limit' parameter. It should be between 1 and 50.");
  }

    const topSupporters = await supportModel.aggregate([
        {
            $match: {
                creatorId: new mongoose.Types.ObjectId(userId),
                status: "paid"
            }
        },
        {
            $group: {
                _id: "$supporterEmail",
                name: { $first: "$supporterName" },
                totalAmount: { $sum: "$amount" },
                totalCoffees: { $sum: "$coffees" },
                totalSupports: { $sum: 1 }
            }
        },
        {
            $sort: { totalCoffees: -1 }
        },
        {
            $limit: limit
        },
        {
            $project: {
                _id: 0,
                name: 1,
                email: "$_id",
                totalAmount: { $divide: ["$totalAmount", 100] },
                totalCoffees: 1,
                totalSupports: 1
            }
        }
    ]);
    sendSuccess(res, 200, "Top supporters fetched successfully", {
        limit,
        data: topSupporters
    });
})

export const getSupports = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    if (!Number.isInteger(page) || page <= 0) {
        throw new AppError(400, "Invalid 'page' parameter. It should be a positive integer.");
    }

    if (!Number.isInteger(limit) || limit <= 0 || limit > 50) {
        throw new AppError(400, "Invalid 'limit' parameter. It should be between 1 and 50.");
    }

    const skip = (page - 1) * limit;

    const supports = await supportModel.aggregate([
        {
            $match: {
                creatorId: new mongoose.Types.ObjectId(userId),
                status: "paid"
            }
        },
        {
            $sort: { paidAt: -1 }
        },
        {
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    { $project: {
                        _id: 0,
                        supporterName: 1,
                        supporterEmail: 1,
                        message: 1,
                        amount: { $divide: ["$amount", 100] },
                        coffees: 1,
                        paidAt: 1
                    }}
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        }
    ]);

    const totalCount = supports[0].totalCount[0]?.count || 0;

    sendSuccess(res, 200, "Supports fetched successfully", {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        data: supports[0].data
    });
});