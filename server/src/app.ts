import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors, { type CorsOptionsDelegate } from 'cors';
import cookieParser from 'cookie-parser';
import express, { type Request } from 'express';
import helmet from 'helmet';

import { allowedOrigins, isProduction } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFoundHandler } from './middlewares/not-found.js';
import { applyNoStoreCache, rejectSensitiveQueryParams } from './middlewares/security.js';
import routes from './routes/index.js';
import { logger } from './utils/logger.js';

function extractOrigin(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const clientDistPath = path.resolve(currentDirectory, '../../client/dist');
const clientIndexPath = path.join(clientDistPath, 'index.html');

export function createApp() {
  const app = express();

  app.disable('x-powered-by');

  if (isProduction) {
    app.set('trust proxy', 1);
  }

  const corsOptionsDelegate: CorsOptionsDelegate<Request> = (req, callback) => {
    const requestOrigin = extractOrigin(
      Array.isArray(req.headers.origin) ? req.headers.origin[0] : req.headers.origin,
    );
    const isAllowedOrigin = Boolean(requestOrigin && allowedOrigins.includes(requestOrigin));

    callback(null, {
      origin: isAllowedOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type'],
      optionsSuccessStatus: 204,
      maxAge: 600,
    });
  };

  app.use((_req, res, next) => {
    res.removeHeader('Server');
    res.setHeader(
      'Permissions-Policy',
      'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()',
    );
    next();
  });
  app.use(cors(corsOptionsDelegate));
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'none'"],
          baseUri: ["'none'"],
          frameAncestors: ["'none'"],
          formAction: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", 'https://fonts.googleapis.com'],
          imgSrc: ["'self'", 'data:'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          connectSrc: ["'self'", ...allowedOrigins],
          objectSrc: ["'none'"],
          manifestSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      frameguard: { action: 'deny' },
      hsts: isProduction
        ? {
            maxAge: 15552000,
            includeSubDomains: true,
            preload: false,
          }
        : false,
      noSniff: true,
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));
  app.use(cookieParser());
  app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      logger.info('http.request.completed', {
        method: req.method,
        path: req.originalUrl.split('?')[0],
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(1)),
        ip: req.ip,
        userAgent: req.get('user-agent')?.slice(0, 160),
      });
    });

    next();
  });
  app.use('/api', applyNoStoreCache, rejectSensitiveQueryParams);

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api', routes);

  if (isProduction) {
    if (existsSync(clientIndexPath)) {
      app.use(
        express.static(clientDistPath, {
          index: false,
          maxAge: '1h',
          etag: true,
        }),
      );

      app.get(/^(?!\/api(?:\/|$)).*$/, (_req, res) => {
        res.sendFile(clientIndexPath);
      });
    } else {
      logger.warn('client.dist.missing', {
        path: clientDistPath,
      });
    }
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
