import { User, UserRole } from '../../entities/user.entity';
import { UserRM } from '../../entities/user_rm.entity';

export class UserResponse {

    id!: string;
    access_token?: string;
    first_name!: string;
    last_name!: string;
    email!: string;
    email_verified!: boolean;
    role!: UserRole;
    profile_picture?: string;
    phone_prefix?: string;
    phone_number?: string;
    phone_verified!: boolean;
    created_at!: Date;
    updated_at!: Date;

    userRMs?: UserRM[];

  constructor(user: User) {
    this.id = user.id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.email_verified = user.email_verified;
    this.role = user.role;
    this.profile_picture = user.profile_picture;
    this.phone_prefix = user.phone_prefix;
    this.phone_number = user.phone_number;
    this.phone_verified = user.phone_verified;
    this.created_at = user.created_at;
    this.updated_at = user.updated_at;
  }

  addAccessToken(access_token: string) {
    this.access_token = access_token;
  }

  toJSON(): any {
    return {
        id: this.id,
        access_token: this.access_token,
        first_name: this.first_name,
        last_name: this.last_name,
        email: this.email,
        email_verified: this.email_verified,
        role: this.role,
        profile_picture: this.profile_picture,
        phone_prefix: this.phone_prefix,
        phone_number: this.phone_number,
        phone_verified: this.phone_verified,
        created_at: this.created_at,
        updated_at: this.updated_at,
        userRMs: this.userRMs
    };
  }
}
