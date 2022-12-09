import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  ManyToOne,
} from "typeorm";
import { IsArray, IsBoolean, IsNumber, IsString } from "class-validator";
import { Bootcamp } from "./Bootcamp.entity";

@Entity({ name: "courses" })
export class Course {
  @PrimaryColumn()
  id: string;

  @Column()
  @IsString()
  title: string;

  @Column()
  @IsString()
  description: string;

  @Column()
  @IsString()
  weeks: string;

  @Column()
  @IsNumber()
  tuition: number;

  @Column("simple-array", { name: "minimum_skill" })
  @IsArray()
  minimumSkill: string[];

  @Column({ name: "scholarship_available", default: false })
  @IsBoolean()
  scholarshipAvailable: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => Bootcamp, (bootcamp) => bootcamp.courses, {
    nullable: true,
    onDelete: "CASCADE",
  })
  bootcamp: Bootcamp;
}
