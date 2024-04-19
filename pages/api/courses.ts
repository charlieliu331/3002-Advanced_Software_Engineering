import { db } from '@vercel/postgres';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler (
    request: NextApiRequest, 
    response: NextApiResponse
){
  const client = await db.connect();

  const results = await client.sql`Select * from courses`;
  response.status(200).json(results.rows);

}

