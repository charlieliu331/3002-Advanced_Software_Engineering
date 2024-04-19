import { db } from '@vercel/postgres'
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler (
        request: NextApiRequest, 
        response: NextApiResponse
  ){
    if (request.method !== 'GET') {
      return response.status(405).end(); // Method Not Allowed
    }
    
    const { title, week_num, lec_num } = request.query;
  
    // Check if any of the parameters are empty
    if (!title || !week_num || !lec_num ) {
        return response.status(400).json({ message: 'All fields are required and cannot be empty' });
    }
    

    try {
      // Check the number of entries that have >= 100 downvotes.
      const result = await db.query(
        `SELECT * FROM histories WHERE title = $1 AND week_num = $2 AND lec_num = $3 AND negative_num - positive_num >= 100`,
        [title, week_num, lec_num]
      );
  
      if (result.rowCount > 0)
      {
            return response.status(200).json({message: 'There are ${result.rowCount} slots available to overwrite transcript.'});
      }
      else
      {
            return response.status(200).json({message: 'No slots available for overwriting transcript.'});
      }

    } catch (error) {
      console.error('Error in finding available slots for overwriting', error);
      response.status(500).json({ message: error });
    }
  }
