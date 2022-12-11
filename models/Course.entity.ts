import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  ManyToOne,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from "typeorm";
import { IsBoolean, IsEnum, IsNumber, IsString } from "class-validator";
import { Bootcamp } from "./Bootcamp.entity";
import { AppDataSource } from "../app";

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

  @ManyToOne(() => Bootcamp, (bootcamp) => bootcamp.courses, {
    nullable: true,
    onDelete: "CASCADE",
  })
  bootcamp: Bootcamp;
}

@EventSubscriber()
export class CourseSubscriber implements EntitySubscriberInterface<Course> {
  listenTo() {
    return Course;
  }

  async afterInsert(event: InsertEvent<Course>) {
    const bootcampRepo = AppDataSource.getRepository(Bootcamp);

    const bootcamps = await bootcampRepo.findOne({
      where: { id: event.entity.bootcamp.toString() },
      relations: {
        courses: true,
      },
    });

    const count = await bootcampRepo
      .createQueryBuilder("b")
      .leftJoinAndSelect("b.courses", "course")
      .where({ id: event.entity.bootcamp.toString() })
      .loadRelationCountAndMap("b.courseCount", "b.courses")
      .getMany();

    if (bootcamps.averageCost === null) {
      await bootcampRepo.update(event.entity.bootcamp.toString(), {
        averageCost: Math.ceil(event.entity.tuition),
      });
    } else {
      await bootcampRepo.update(event.entity.bootcamp.toString(), {
        averageCost: Math.ceil(
          // @ts-ignore
          (bootcamps.averageCost + event.entity.tuition) / count[0].courseCount
        ),
      });
    }
  }
}
