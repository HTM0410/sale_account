import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Capture unhandled promise rejections
  beforeSend(event) {
    // Filter out development errors in production
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry client event captured:', event);
    }
    return event;
  },
});

// Export navigation instrumentation hook
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;