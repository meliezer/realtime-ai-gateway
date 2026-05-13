export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';

  content: string;
}

export interface ChatCompletionRequest {
  model: string;

  stream?: boolean;

  messages: ChatMessage[];
}
