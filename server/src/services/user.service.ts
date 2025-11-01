import UserModel from "../models/User.model";

export const findByIdUserService = async (userId: string) => {
  return await UserModel.findById(userId);
};
