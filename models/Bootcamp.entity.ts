import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  PrimaryColumn,
} from "typeorm";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from "class-validator";

import slugify from "slugify";
import { geocoder } from "../utils/nodeGeocoder";
import { Point } from "geojson";

@Entity({ name: "bootcamp" })
export class BootcampSchema {
  // @PrimaryGeneratedColumn("uuid")
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  @Length(1, 50, { message: "Name can not be more than 50 characters" })
  @IsString()
  name: string;

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

  /***
   * Auto-generated entries start here:
   * ***/

  @Column({ default: "" })
  slug: string;

  @Index({ spatial: true })
  @Column({
    type: "geography",
    spatialFeatureType: "Point",
    srid: 4326,
    nullable: true,
  })
  location: Point;

  @Column()
  @IsOptional()
  formattedAddress: string;

  @Column()
  @IsOptional()
  street: string;

  @Column()
  @IsOptional()
  city: string;

  @Column()
  @IsOptional()
  state: string;

  @Column()
  @IsOptional()
  zipcode: string;

  @Column()
  @IsOptional()
  country: string;

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

  /***
   * END
   * ***/

  @Column("simple-array")
  @IsArray()
  careers: string[];

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

  @BeforeInsert()
  async createLoc() {
    const loc = await geocoder.geocode(this.address);

    this.location = {
      type: "Point",
      coordinates: [loc[0].longitude, loc[0].latitude],
    };
    this.formattedAddress = loc[0].formattedAddress;
    this.street = loc[0].streetName;
    this.city = loc[0].city;
    this.state = loc[0].stateCode;
    this.zipcode = loc[0].zipcode;
    this.country = loc[0].countryCode;
  }
}
