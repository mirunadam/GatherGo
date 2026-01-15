import { UserRole } from "./user-role.model";

export interface User {
  uuid: string;
  role: UserRole;
  username: string;
  fullName: string;
  email: string;
  phone: string;
}
