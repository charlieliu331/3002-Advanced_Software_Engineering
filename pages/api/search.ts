import { db } from '@vercel/postgres';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler (
    request: NextApiRequest, 
    response: NextApiResponse
){
    const client = await db.connect();

    //  extract title, academic_year, semester_num, week_num, and lec_num from the request 
    const { title, academic_year, semester_num, week_num, lec_num } = request.query;

    let query: string = 'SELECT * FROM histories WHERE';
    let conditions: string[] = [];
    let values = [];

    // Function to check if a parameter is not "<empty>"
    const isNotEmpty = (param: any): boolean => param !== undefined && param !== '<empty>';

    // Dynamically add conditions based on provided parameters, excluding "<empty>"
    if (isNotEmpty(title)) {
        conditions.push('title = $' + (conditions.length + 1));
        values.push(title);
    }
    if (isNotEmpty(academic_year)) {
        conditions.push('academic_year = $' + (conditions.length + 1));
        values.push(academic_year);
    }
    if (isNotEmpty(semester_num)) {
        conditions.push('semester_num = $' + (conditions.length + 1));
        values.push(semester_num);
    }
    if (isNotEmpty(week_num)) {
        conditions.push('week_num = $' + (conditions.length + 1));
        values.push(week_num);
    }
    if (isNotEmpty(lec_num)) {
        conditions.push('lec_num = $' + (conditions.length + 1));
        values.push(lec_num);
    }

    // Adding the new filter for negative_num and positive_num
    conditions.push('(negative_num - positive_num) < $' + (conditions.length + 1));
    values.push(100);

    // Construct the final query based on the conditions
    if (conditions.length > 0) {
        query += ' ' + conditions.join(' AND ');
    } else {
        // If no valid conditions are provided, default to selecting all records
        query = 'SELECT * FROM histories';
    }

    // Adding the ORDER BY and LIMIT clauses
    query += ' ORDER BY positive_num DESC LIMIT 3';

    try {
        const result = await db.query(query, values);
        if (result.rowCount > 0) {
            // If an entry is found, return its details
            return response.status(200).json({ message: "Entry found", entry: result.rows });
        } 
        else {
            return response.status(200).json({ message: "No entry found", entry: [] });
        }

    } catch (error) {
        // Handle any errors that occur during the database operations
        response.status(500).json({ message: "Failed to search in histories" });
        console.error('Database query error:', error);
    }

}

