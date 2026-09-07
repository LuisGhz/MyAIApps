import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { OpenAIService } from './services/openai.service';
import { JwtStrategy } from './strategies';

@Global()
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [OpenAIService, JwtStrategy],
  exports: [OpenAIService, PassportModule],
})
export class CommonModule {}
