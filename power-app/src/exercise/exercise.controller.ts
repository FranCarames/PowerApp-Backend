import {
  Controller,
  Get,
  Post,
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

@Controller('exercise')
export class ExerciseController {
    constructor(private exerciseService: ExerciseService) {}

    @Get('all')
    async getAllExercises() {
        return "Tu mama me mama la mema"
    }

    // @Get('/all')
    // async getAllMuscles(
    //     @Res() res: Response
    // ) {
    //     this.musclesService.getAllMuscles(res);
    // }

    // @Get('/get/:id')
    // async getMuscleById(@Param() muscleId: ParameterIdDto, @Res() res: Response) {
    //     this.musclesService.getMuscleById(muscleId.id, res);
    // }

    @Post('create')
    async createExercise(
        @Body() createExerciseDto: CreateExerciseDto,
        @Res() res: Response,
    ) {
        this.exerciseService.createExercise(createExerciseDto, res);
    }

    // @Post('edit/:id')
    // async editMuscle(
    //     @Param() idMuscle: ParameterIdDto,
    //     @Body() editMuscleDto: EditMuscleDto,
    //     @Res() res: Response,
    // ) {
    //     this.musclesService.editMuscle(idMuscle.id, editMuscleDto, res);
    // }

    // @Delete(':id')
    // async deleteMuscle(
    //     @Param() idMuscle: ParameterIdDto,
    //     @Res() res: Response,
    // ) {
    //     this.musclesService.deleteMuscle(idMuscle.id, res);
    // }
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
