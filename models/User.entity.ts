import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IsEmail, IsString, Length } from "class-validator";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

export enum RoleType {
  USER = "user",
  PUBLISHER = "publisher",
}

@Entity({ name: "users" })
export class User {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  @IsString()
  name: string;

  @Column({ unique: true })
  @IsEmail({ message: "Please add a valid email" })
  @IsString()
  email: string;

  @Column({
    type: "enum",
    enum: RoleType,
    default: RoleType.USER,
  })
  role: RoleType;

  /***
   * Auto-generated entries start here:
   * ***/

  @Column({ select: false })
  @Length(5)
  password: string;

  @Column({ name: "reset_password_token", default: "" })
  resetPasswordToken: string;

  @Column({ name: "reset_password_expire", default: "" })
  resetPasswordExpire: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  /***
   * END
   * ***/

  @BeforeInsert()
  async hashPassword() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
}
