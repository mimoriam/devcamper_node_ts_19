import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";
import {
  Max,
  Matches,
  IsString,
  IsEmail,
  IsInt,
  Length,
} from "class-validator";

// export type Career =
//   | "Web Development"
//   | "Mobile Development"
//   | "UI/UX"
//   | "Data Science"
//   | "Business"
//   | "Other";

@Entity()
export class BootcampSchema {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ unique: true })
  @Max(50, { message: "Name can not be more than 50 characters" })
  @IsString()
  name: string;

  @Column({ nullable: true })
  slug: string;

  @Column()
  @Max(500, { message: "Description can not be more than 500 characters" })
  @IsString()
  description: string;

  @Column()
  @Matches(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
    { message: "Please use a valid URL with HTTP or HTTPS" }
  )
  @IsString()
  website: string;

  @Column()
  @Max(20, { message: "Phone number can not be longer than 20 characters" })
  @IsString()
  phone: string;

  @Column()
  @IsEmail({ message: "Please add a valid email" })
  email: string;

  @Column()
  address: string;

  // @Column({
  //   type: "enum",
  //   enum: [
  //     "Web Development",
  //     "Mobile Development",
  //     "UI/UX",
  //     "Data Science",
  //     "Business",
  //     "Other",
  //   ],
  //   default: "Other",
  // })
  @Column("simple-array")
  careers: string[];

  @Column({ nullable: true })
  @Length(1, 10)
  @IsInt()
  averageRating: number;

  @Column({ nullable: true })
  @IsInt()
  averageCost: number;

  @Column({ default: "no_photo.jpg" })
  photo: string;

  @Column({ default: false })
  housing: boolean;

  @Column({ default: false })
  jobAssistance: boolean;

  @Column({ default: false })
  jobGuarantee: boolean;

  @Column({ default: false })
  acceptGi: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
