import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { SpaceModel } from '../models/spaceModel';

const router = Router();

const API_KEY = '70692c1291964e23b0eb43c83209d8c3';
const BASE_URL = 'https://newsapi.org/v2';


function buildApiUrl(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('apiKey', API_KEY!);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  
  return url.toString();
}

export async function getTopHeadlines(country: string = 'us', page: number = 1): Promise<any> {
  const url = buildApiUrl('/top-headlines', {
    country,
    page: page.toString(),
    pageSize: '20'
  });
  
  const response = await fetch(url);
  
  if (!response.ok) {
    console.log(response);
    const error: any = await response.json();
    throw new Error(error.message || 'Failed to fetch top headlines');
  }
  
  return response.json();
}

// POST /api/spaces - Create a new space
router.get('/getTopHeadlines', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getTopHeadlines();
    return res.status(201).send(result);
  } catch (err) {
    return next(err);
  }
});

export default router; 