import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

// Hook để sử dụng translations trong components
export const useI18n = () => {
  const { t, i18n } = useTranslation('common')
  
  return {
    t,
    locale: i18n.language,
    isVietnamese: i18n.language === 'vi',
    isEnglish: i18n.language === 'en',
    changeLanguage: i18n.changeLanguage,
  }
}

// Utility function để format giá tiền theo locale
export const formatPrice = (price: number, locale: string = 'vi') => {
  if (locale === 'vi') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }
  
  // Fallback to VND format with English separators
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

// Server-side props helper với caching
export const getStaticTranslations = async (locale: string) => {
  return {
    ...(await serverSideTranslations(locale, ['common'])),
  }
}

// Helper cho dynamic imports của translations
export const getServerSideTranslations = async (
  locale: string,
  namespaces: string[] = ['common']
) => {
  return await serverSideTranslations(locale, namespaces)
}

// Type helpers cho translations
export type TranslationKey = string
export type Locale = 'vi' | 'en'

// Constants
export const SUPPORTED_LOCALES: Locale[] = ['vi', 'en']
export const DEFAULT_LOCALE: Locale = 'vi'
export const LOCALE_NAMES = {
  vi: 'Tiếng Việt',
  en: 'English'
}