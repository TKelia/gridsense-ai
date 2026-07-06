export type Route =
  | 'home'
  | 'dashboard'
  | 'setup'
  | 'about'
  | 'how'
  | 'support'
  | 'terms'
  | 'privacy'
  | 'login'
  | 'workspace'
  | 'properties'
  | 'pricing'
  | 'checkout'
  | 'device'
  | 'verify'

export const SUPPORT_PHONE_DISPLAY = '+250 783 619 522'
export const SUPPORT_PHONE_TEL = '+250783619522'
export const SUPPORT_WHATSAPP = 'https://wa.me/250783619522'
export const SUPPORT_EMAIL = 'support@gridsense.rw'

// Official, live sources & references (verified to resolve). Used on About,
// Support, and in the Footer. `labelKey` maps to an i18n string.
export interface OfficialSource {
  labelKey: 'src_reg_tariffs' | 'src_rura' | 'src_reg' | 'src_law' | 'src_dpo'
  url: string
}

export const OFFICIAL_SOURCES: OfficialSource[] = [
  { labelKey: 'src_reg_tariffs', url: 'https://www.reg.rw/customer-service/tariffs/' },
  { labelKey: 'src_rura', url: 'https://www.rura.rw' },
  { labelKey: 'src_reg', url: 'https://www.reg.rw' },
  { labelKey: 'src_law', url: 'https://rwandalii.org/akn/rw/act/law/2021/58/eng@2021-10-15' },
  { labelKey: 'src_dpo', url: 'https://dpo.gov.rw' },
]
