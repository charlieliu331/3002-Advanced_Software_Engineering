
import { NextApiRequest, NextApiResponse } from 'next';
import { ChatCompletion, ChatCompletionMessage } from 'openai/resources';
import openai, { getEmbedding } from '../../../lib/openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const body = await req.body;
    const messages: ChatCompletionMessage[] = body.messages;

    const messagesTruncated = messages.slice(-6);

    console.log(messages);

    const systemMessage: ChatCompletionMessage = {
      role: 'assistant',
      content: 'You are an intelligent teaching assistant in university. You may receive questions from students.',
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [systemMessage, ...messagesTruncated],
    });

    // Read chunks from the stream and send them to the client
    const stream: ReadableStream<any> = OpenAIStream(response);

    // Set the response content type
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    // Send each chunk to the client
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }

    // End the response
    res.end();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}


