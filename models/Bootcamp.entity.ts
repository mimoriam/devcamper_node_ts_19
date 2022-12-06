import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BeforeInsert,
} from "typeorm";
import {
  Max,
  Min,
  Matches,
  IsString,
  IsEmail,
  IsInt,
  Length, IsOptional,
} from "class-validator";
import slugify from "slugify";

@Entity({ name: "bootcamp" })
export class BootcampSchema {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ unique: true })
  @Length(1, 50, { message: "Name can not be more than 50 characters" })
  @IsString()
  name: string;

  @Column({ default: "" })
  slug: string;

  @Column()
  @Length(1, 500, {
    message: "Description can not be more than 500 characters",
  })
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
  @Length(6, 20, {
    message: "Phone number can not be longer than 20 characters",
  })
  @IsString()
  phone: string;

  @Column({ unique: true })
  @IsEmail({ message: "Please add a valid email" })
  email: string;

  @Column()
  address: string;

  @Column("simple-array")
  careers: string[];

  @Column({ nullable: true })
  @IsOptional()
  @Min(1)
  @Max(10)
  @IsInt()
  averageRating: number;

  @Column({ nullable: true })
  @IsOptional()
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

  @BeforeInsert()
  createSlug() {
    this.slug = slugify(this.name, { lower: true });
  }
}
