import mongoose from "mongoose";
import { UserDocument } from "../../models/user.model";

// Type for user without password (what passport returns from omitPassword)
export interface AuthenticatedUser {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  profilePicture: string | null;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
    interface Request {
      user?: User;
    }
  }
}
