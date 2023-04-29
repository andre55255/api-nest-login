import { Module } from '@nestjs/common';
import { RootController } from './_root.controller';

@Module({
    controllers: [RootController]
})
export class RootModule {}