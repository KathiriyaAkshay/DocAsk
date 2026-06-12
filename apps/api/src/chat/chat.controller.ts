import { Body, Controller, Post } from '@nestjs/common';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ChatService } from './chat.service';
import type { ChatRequest, ChatResponse } from '../common/types';

class ChatMessageDto {
  @IsString()
  role!: 'user' | 'assistant';

  @IsString()
  content!: string;
}

class ChatRequestDto implements ChatRequest {
  @IsString()
  question!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() body: ChatRequestDto): Promise<ChatResponse> {
    return this.chatService.ask(body);
  }
}
