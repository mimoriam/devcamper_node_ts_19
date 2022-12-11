import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IsEmail, IsString, Length } from "class-validator";

import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { Bootcamp } from "./Bootcamp.entity";

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

  // Instead of select: false, use class-transformer's @Exclude()
  // @Column({ select: false })
  @Column()
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

  @OneToMany(() => Bootcamp, (bootcamp) => bootcamp.user, { cascade: true })
  bootcamps: Bootcamp[];

  @BeforeInsert()
  async hashPassword() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  getSignedJwtToken() {
    return sign({ id: this.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  }

  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}
