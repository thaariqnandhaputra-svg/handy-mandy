import { json, type RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export const GET: RequestHandler = async () => {
  const startTime = Date.now();
  let dbStatus = 'ok';
  let productCount = 0;
  let userCount = 0;

  try {
    const [products, users] = await Promise.all([
      prisma.product.count(),
      prisma.user.count()
    ]);
    productCount = products;
    userCount = users;
  } catch (error: any) {
    dbStatus = `error: ${error?.message || 'Database connection failed'}`;
  }

  const responseTimeMs = Date.now() - startTime;

  return json({
    status: dbStatus === 'ok' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      productCount,
      userCount
    },
    responseTimeMs
  });
};
