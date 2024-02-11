import { Module } from '@nestjs/common'
import * as process from 'process'

@Module({})
export class LocaleConfigModule {
  //public static readonly LOCALE_COUNTRY = (process.env.APP_LOCALE_COUNTRY ||'es-ES') as CountryCode
  public static readonly LOCALE_MOBILE = (process.env.APP_LOCALE_MOBILE ||
    'es-ES') as validator.MobilePhoneLocale
  public static readonly LOCALE_ID_CARD = (process.env.APP_LOCALE_ID_CARD ||
    'ES') as validator.IdentityCardLocale
}
