import { db } from '@vercel/postgres';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler (
  request: NextApiRequest, 
  response: NextApiResponse
){
  if (request.method !== 'POST') {
    return response.status(405).end(); // Method Not Allowed
  }
  
  // Extract data from request body
  const { title, week_num, lec_num, transcript, academic_year, semester_num } = request.body;

  // Check if any of the parameters are empty
  if (!title || !week_num || !lec_num || !transcript || !academic_year || !semester_num) {
      return response.status(400).json({ message: 'All fields are required and cannot be empty' });
  }


  try {
    // Check if there is enough slot
    const checkResult = await db.query(
      `SELECT * FROM histories WHERE title = $1 AND week_num = $2 AND lec_num = $3 AND academic_year = $4 AND semester_num = $5 AND positive_num - negative_num >= -100`,
      [title, week_num, lec_num, academic_year, semester_num]
    );

    if (checkResult.rowCount >= 3) {
      return response.status(409).json({ message: `Cannot insert data. There are ${checkResult.rowCount} entries with >= 100 more downvotes than upvotes.` });
    }

    // If there is enough space, proced to insert
    const insertResult = await db.query(
      `INSERT INTO histories (title, week_num, lec_num, transcript, academic_year, semester_num) VALUES ($1, $2, $3, $4, $5, $6)`,
      [title, week_num, lec_num, transcript, academic_year, semester_num]
    );

    // Respond with the inserted data
    response.status(201).json({message: 'Success'});

  } catch (error) {
    console.error('Failed to insert data', error);
    response.status(500).json({ message: error });
  }

}

