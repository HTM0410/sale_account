module.exports = {
  i18n: {
    defaultLocale: 'vi',
    locales: ['vi', 'en'],
    localeDetection: true,
  },
  fallbackLng: {
    default: ['vi'],
    en: ['vi']
  },
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  ns: ['common'],
  defaultNS: 'common',
}