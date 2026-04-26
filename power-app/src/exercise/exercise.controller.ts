import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Body,
  Headers,
  Query,
  Res,
} from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { Response } from 'express';
import { ParameterIdDto } from '../dtos/parameter_id.dto';
import { CreateExerciseDto } from '../dtos/exercise/create_exercise.dto';
import { EditExerciseDto } from '../dtos/exercise/edit_exercise.dto';

@Controller('exercise')
export class ExerciseController {
    constructor(private exerciseService: ExerciseService) {}

    @Get('/all')
    async getAllExercises(
        @Res() res: Response
    ) {
        this.exerciseService.getAllExercises(res);
    }

    @Post('create')
    async createExercise(
        @Body() createExerciseDto: CreateExerciseDto,
        @Res() res: Response,
    ) {
        this.exerciseService.createExercise(createExerciseDto, res);
    }

    @Post('edit/:id')
    async editExercise(
        @Param() idExercise: ParameterIdDto,
        @Body() editExerciseDto: EditExerciseDto,
        @Res() res: Response,
    ) {
        this.exerciseService.editExercise(idExercise.id, editExerciseDto, res);
    }

    @Delete(':id')
    async deleteExercise(
        @Param() idMuscle: ParameterIdDto,
        @Res() res: Response,
    ) {
        this.exerciseService.deleteExercise(idMuscle.id, res);
    }

    @Get('ExMuscles/all')
    async getAllExercisedMuscles(
        @Res() res: Response
    ) {
        this.exerciseService.getAllExercisedMuscles(res);
    }
}




// import { Response } from 'express';
// import { AuthenticableDTO } from 'src/dtos/auth/authenticable.dto';
// import { GetUserReviewDto } from 'src/dtos/review/get_user_review.dto';
// import { GetProductReviewDto } from 'src/dtos/review/get_product_review.dto';
// import { AddEditUserReviewDto } from 'src/dtos/review/add_edit_user_review.dto';
// import { DeleteUserReviewDto } from 'src/dtos/review/delete_user_review.dto';
// import { AddEditProductReviewDto } from 'src/dtos/review/add_edit_product_review.dto';
// import { DeleteProductDto } from 'src/dtos/product/delete_product.dto';
// import { ErrorCodes, getErrorObject } from 'src/schemas/error_code.schema';

// @Controller('review')
// export class ReviewController {
  

//   @Get('user')
//   async getUserReviews(
//     @Headers() header: AuthenticableDTO,
//     @Query() parameters: GetUserReviewDto,
//     @Res() res: Response,
//   ) {
//     const accessToken = header.authorization;

//     if (accessToken) {
//       this.reviewService.getUserReviews(accessToken, parameters, res);
//     } else {
//       res.status(401).send(getErrorObject(ErrorCodes.noAccessTokenInput));
//     }
//   }

  // @Post('user')
  // async addEditUserReview(
  //   @Headers() header: AuthenticableDTO,
  //   @Body() userReview: AddEditUserReviewDto,
  //   @Res() res: Response,
  // ) {
  //   const accessToken = header.authorization;

  //   if (accessToken) {
  //     this.reviewService.addEditUserReview(accessToken, userReview, res);
  //   } else {
  //     res.status(401).send(getErrorObject(ErrorCodes.noAccessTokenInput));
  //   }
  // }

//   @Delete('user')
//   async deleteUserReview(
//     @Headers() header: AuthenticableDTO,
//     @Body() userReview: DeleteUserReviewDto,
//     @Res() res: Response,
//   ) {
//     const accessToken = header.authorization;

//     if (accessToken) {
//       this.reviewService.deleteUserReview(accessToken, userReview, res);
//     } else {
//       res.status(401).send(getErrorObject(ErrorCodes.noAccessTokenInput));
//     }
//   }

//   @Get('product')
//   async getProductReviews(
//     @Headers() header: AuthenticableDTO,
//     @Query() parameters: GetProductReviewDto,
//     @Res() res: Response,
//   ) {
//     const accessToken = header.authorization;

//     if (accessToken) {
//       this.reviewService.getProductReviews(accessToken, parameters, res);
//     } else {
//       res.status(401).send(getErrorObject(ErrorCodes.noAccessTokenInput));
//     }
//   }

//   @Post('product')
//   async addEditProductReview(
//     @Headers() header: AuthenticableDTO,
//     @Body() productReview: AddEditProductReviewDto,
//     @Res() res: Response,
//   ) {
//     const accessToken = header.authorization;

//     if (accessToken) {
//       this.reviewService.addEditProductReview(accessToken, productReview, res);
//     } else {
//       res.status(401).send(getErrorObject(ErrorCodes.noAccessTokenInput));
//     }
//   }

//   @Delete('product')
//   async deleteProductReview(
//     @Headers() header: AuthenticableDTO,
//     @Body() productReview: DeleteProductDto,
//     @Res() res: Response,
//   ) {
//     const accessToken = header.authorization;

//     if (accessToken) {
//       this.reviewService.deleteProductReview(accessToken, productReview, res);
//     } else {
//       res.status(401).send(getErrorObject(ErrorCodes.noAccessTokenInput));
//     }
//   }
// }
