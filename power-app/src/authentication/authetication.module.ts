import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';

// import { User, UserSchema } from 'src/schemas/users/user.schema';
// import { PrelaunchUser, PrelaunchUserSchema } from 'src/schemas/users/prelaunch_user.schema';
// import { Notification, NotificationSchema } from 'src/schemas/notification.schema';
import { AutheticationService } from './authetication.service';
import { AutheticationController } from './authentication.controller';
// import { AuthService } from './auth/auth.service';
// import { PaymentService } from 'src/payment/payment.service';
// import { Rent, RentSchema } from 'src/schemas/rent.schema';
// import { Product, ProductSchema } from 'src/schemas/product/product.schema';


@Module({
    imports: [
        // MongooseModule.forFeature([
        //     {
        //         name: User.name,
        //         schema: UserSchema,
        //     },
        //     {
        //         name: PrelaunchUser.name,
        //         schema: PrelaunchUserSchema,
        //     },
        //     {
        //       name: Notification.name,
        //       schema: NotificationSchema,
        //     },
        //     {
        //         name: Product.name,
        //         schema: ProductSchema,
        //     },
        //     {
        //         name: Rent.name,
        //         schema: RentSchema,
        //     }
        // ])
    ],
    controllers: [AutheticationController],
    providers: [AutheticationService],
    exports: [AutheticationService]
})
export class AuthenticationModule {}
