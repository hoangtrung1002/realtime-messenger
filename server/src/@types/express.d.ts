import { UserDocument } from "../models/User.model";

declare global {
  namespace Express {
    interface User extends UserDocument {
      _id?: any;
    }
  }
}
