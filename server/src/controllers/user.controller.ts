import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { getUserService } from "../services/user.service";

export const getUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const users = await getUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Users retrieved successfully",
      users,
    });
  }
);
