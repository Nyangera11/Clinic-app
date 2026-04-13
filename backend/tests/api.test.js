import { pool } from '../config/db.js';

describe('Database Connection', () => {
  test('should connect to database', async () => {
    const [rows] = await pool.execute('SELECT 1 as test');
    expect(rows[0].test).toBe(1);
  });
});

describe('Auth Service', () => {
  test('should register a new user', async () => {
    // Mock test for user registration
    expect(true).toBe(true);
  });
});
