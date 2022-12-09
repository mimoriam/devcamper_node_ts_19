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
import { IsBoolean, IsEnum, IsNumber, IsString } from "class-validator";
import { Bootcamp } from "./Bootcamp.entity";

export enum minimumSkillType {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

@Entity({ name: "courses" })
@Index(["weeks", "tuition", "minimumSkill", "scholarshipAvailable"], {
  fulltext: true,
})
@Index(["title"], { unique: true, fulltext: true })
export class Course {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  @IsString()
  title: string;

  @Column()
  @IsString()
  description: string;

  @Column()
  @IsNumber()
  weeks: number;

  @Column()
  @IsNumber()
  tuition: number;

  @Column({
    type: "enum",
    enum: minimumSkillType,
    default: minimumSkillType.BEGINNER,
    name: "minimum_skill",
  })
  @IsEnum(minimumSkillType)
  minimumSkill: minimumSkillType;

  @Column({ name: "scholarship_available", default: false })
  @IsBoolean()
  scholarshipAvailable: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ManyToOne((type) => Bootcamp, (bootcamp) => bootcamp.courses, {
    nullable: true,
    onDelete: "CASCADE",
  })
  bootcamp: Bootcamp;
}
