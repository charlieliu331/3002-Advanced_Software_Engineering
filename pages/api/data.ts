import { db } from '@vercel/postgres';

export default async function handler (request, response){
  const client = await db.connect();

  // create
  // const create = await client.sql`
  //   CREATE TABLE histories (
  //     id SERIAL PRIMARY KEY,
  //     title VARCHAR (50) NOT NULL,
  //     week_num SMALLINT NOT NULL,
  //     lec_num SMALLINT NOT NULL,
  //     upload_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  //     transcript TEXT NOT NULL
  //   )
  // `;

  // const create = await client.sql`
  //   CREATE TABLE courses (
  //     id SERIAL PRIMARY KEY,
  //     title VARCHAR (50) NOT NULL,
  //     code VARCHAR (50) NOT NULL
  //   )
  // `;

  // await client.sql`
  //     ALTER TABLE histories 
  //     ADD COLUMN academic_year VARCHAR (50),
  //     ADD COLUMN semester_num SMALLINT,
  //     ADD COLUMN positive_num SMALLINT DEFAULT 0,
  //     ADD COLUMN negative_num SMALLINT DEFAULT 0,
  //     ADD COLUMN is_showing BOOLEAN DEFAULT true
  // `;

  // await client.sql`
  //     INSERT INTO courses (title, code)
  //     VALUES('SC4002/CE4045/CZ4045', 'Natural Language Processing')
  // `;

  // const info = await client.sql`
  //   SELECT column_name, data_type, character_maximum_length, is_nullable
  //   FROM information_schema.columns
  //   WHERE table_name = 'histories'
  // `
  
  const results = await client.sql`Select * from histories`;

  return response.status(200).json({results: results.rows});

  // const users = await client.sql`Select * from users`;
  // return response.status(200).json({users: users.rows});
}

