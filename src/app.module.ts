import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UtilsModule } from './common/utils/utils.module';
import { ConfigModule } from '@nestjs/config';
import { TenantModule } from './tenant/tenant.module';
import { RoleModule } from './role/role.module';
import { RolePermissionModule } from './role-permission/role-permission.module';

@Module({
  imports: [
    AuthModule,
    UtilsModule,
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   envFilePath: '.env',
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        if (!config.JWT_REFRESH_SECRET) {
          throw new Error('Missing Google OAuth environment variables');
        }
        console.log(config);
        return config;
      },
    }),
    TenantModule,
    RoleModule,
    RolePermissionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
