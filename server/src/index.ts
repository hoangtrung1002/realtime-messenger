import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import passport from "passport";
import connectDatabase from "./config/database.config";
import { Env } from "./config/env.config";
import { HTTPSTATUS } from "./config/http.config";
import "./config/passport.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import router from "./routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(passport.initialize());

app.get(
  "/demo",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Server demo mode",
      status: "OK",
    });
  })
);

app.use("/api", router);

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  await connectDatabase();
  console.log(`Server running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
});
