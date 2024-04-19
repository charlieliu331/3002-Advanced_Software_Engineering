import { db } from '@vercel/postgres';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler (
  request: NextApiRequest, 
  response: NextApiResponse
){
  if (request.method !== 'PUT') {
    return response.status(405).end();
  }
  
  // Extract data from request body
  const { id, updateType } = request.query;

  // Check if any of the parameters are empty
  if (!id || !updateType) {
      return response.status(400).json({ message: 'All fields are required and cannot be empty' });
  }

  // Determine which column to update
  let columnToUpdate;
  if (updateType === 'incrementPositive') {
    columnToUpdate = 'positive_num';
  } else if (updateType === 'incrementNegative') {
    columnToUpdate = 'negative_num';
  } else {
    return response.status(400).json({ message: 'Invalid updateType' });
  }

  try {
    // Update the specified column in the database
    const result = await db.query(
      `UPDATE histories SET ${columnToUpdate} = ${columnToUpdate} + 1 
      WHERE id = $1`,
      [id]
    );

    // Respond with success message
    response.status(200).json({message: 'Update successful'});

  } catch (error) {
    console.error('Failed to update data', error);
    response.status(500).json({ message: error });
  }
}
