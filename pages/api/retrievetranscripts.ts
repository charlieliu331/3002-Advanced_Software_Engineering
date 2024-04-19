import { db } from '@vercel/postgres';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== 'GET') {
    return response.status(405).end(); 
  }

  const { title, week_num, lec_num } = request.query; 

  // Check if any of the parameters are empty
  if (!title || !week_num || !lec_num) {
    return response
      .status(400)
      .json({ message: 'All fields are required and cannot be empty' });
  }

  try {
    // Retrieve the top 3 records sorted by highest positive_num
    const result = await db.query(
      `SELECT * FROM histories WHERE title = $1 AND week_num = $2 AND lec_num = $3 AND negative_num - positive_num < 100 ORDER BY positive_num DESC LIMIT 3`,
      [title, week_num, lec_num]
    );

    if (result.rowCount > 0) {
      return response.status(200).json({ transcripts: result.rows });
    } else {
      return response
        .status(404)
        .json({ message: 'No transcripts found matching the criteria.' });
    }
  } catch (error) {
    console.error('Error in retrieving transcripts', error);
    response.status(500).json({ message: 'Internal server error' });
  }
}