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
  Length,
  IsOptional,
  IsBoolean,
  IsDate,
  IsArray,
  IsNumber,
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
  @IsString()
  email: string;

  @Column()
  @IsString()
  address: string;

  @Column("simple-array")
  @IsArray()
  careers: string[];

  @Column({ nullable: true })
  @IsOptional()
  @Min(1)
  @Max(10)
  @IsNumber()
  averageRating: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsNumber()
  averageCost: number;

  @Column({ default: "no_photo.jpg" })
  photo: string;

  @Column({ default: false })
  @IsBoolean()
  housing: boolean;

  @Column({ default: false })
  @IsBoolean()
  jobAssistance: boolean;

  @Column({ default: false })
  @IsBoolean()
  jobGuarantee: boolean;

  @Column({ default: false })
  @IsBoolean()
  acceptGi: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  createSlug() {
    this.slug = slugify(this.name, { lower: true });
  }
}
