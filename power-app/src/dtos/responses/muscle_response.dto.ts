import { Muscle } from "../../entities/muscle.entity";
import { MuscleGroup } from "../../entities/muscle_group.entity";
import { ExercisedMuscle } from "../../entities/exercised_muscle.entity";
import { Exercise } from "../../entities/exercise.entity";

export class MuscleResponse {

    id!: string;
    muscle_group_id!: string;
    name!: string;
    description!: string;
    image_url?: string;
    preview_image?: string;
    created_at!: Date;
    updated_at!: Date;

  constructor(muscle: Muscle) {
    this.id = muscle.id;
    this.muscle_group_id = muscle.muscle_group_id;
    this.name = muscle.name;
    this.description = muscle.description;
    this.image_url = muscle.image_url;
    this.preview_image = muscle.preview_image;
    this.created_at = muscle.created_at;
    this.updated_at = muscle.updated_at;
  }

  toJSON(): any {
    return {
        id: this.id,
        muscle_group_id: this.muscle_group_id,
        name: this.name,
        description: this.description,
        image_url: this.image_url,
        preview_image: this.preview_image,
        created_at: this.created_at,
        updated_at: this.updated_at
    };
  }
}