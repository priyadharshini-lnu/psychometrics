import { FC, SVGProps } from 'react'
import marshWordmarkWhite from '../../assets/images/branding/marsh/wordmark-white.svg'
import mercerWordmarkWhite from '../../assets/images/branding/mercer_a_marsh_business/wordmark-white.svg'
import marshWordmarkNavy from '../../assets/images/branding/marsh/wordmark-navy.svg'
import mercerWordmarkNavy from '../../assets/images/branding/mercer_a_marsh_business/wordmark-navy.svg'
import marshMonogramNavy from '../../assets/images/branding/marsh/monogram-navy.svg'
import mercerMonogramNavy from '../../assets/images/branding/mercer_a_marsh_business/monogram-navy.svg'
import MarshWordmark from '../../assets/images/branding/marsh/wordmark-currentcolor.svg?react'
import MercerWordmark from '../../assets/images/branding/mercer_a_marsh_business/wordmark-currentcolor.svg?react'
import MarshMonogram from '../../assets/images/branding/marsh/monogram-currentcolor.svg?react'
import MercerMonogram from '../../assets/images/branding/mercer_a_marsh_business/monogram-currentcolor.svg?react'

// Names are static because the branding locale files were deleted; the commented lookups need them back.
export const brand = (): string => window.PsyGlobalState.brand

const DISPLAY_NAMES: Record<string, string> = {
  marsh: 'Marsh',
  mercer_a_marsh_business: 'Mercer, a Marsh business',
}

const LEGAL_NAMES: Record<string, string> = {
  marsh: 'Marsh',
  mercer_a_marsh_business: 'Mercer Talent Enterprise',
}

const PRODUCT_NAME = 'Lighthouse'

export const displayName = (): string => DISPLAY_NAMES[brand()]
// export const displayName = (): string => window.I18n.t(`branding.${brand()}.display_name`)

export const legalName = (): string => LEGAL_NAMES[brand()]
// export const legalName = (): string => window.I18n.t(`branding.${brand()}.legal_name`)

export const productName = (): string => PRODUCT_NAME
// export const productName = (): string => window.I18n.t('product_name')

export const supportEmail = (): string => window.PsyGlobalState.supportEmail

// Baked fills, not currentColor: an image tag gives currentColor nothing to resolve against.
const WORDMARK_WHITE_URLS: Record<string, string> = {
  marsh: marshWordmarkWhite,
  mercer_a_marsh_business: mercerWordmarkWhite,
}

export const wordmarkWhiteUrl = (): string => WORDMARK_WHITE_URLS[brand()]

const WORDMARK_NAVY_URLS: Record<string, string> = {
  marsh: marshWordmarkNavy,
  mercer_a_marsh_business: mercerWordmarkNavy,
}

export const wordmarkNavyUrl = (): string => WORDMARK_NAVY_URLS[brand()]

const MONOGRAM_NAVY_URLS: Record<string, string> = {
  marsh: marshMonogramNavy,
  mercer_a_marsh_business: mercerMonogramNavy,
}

export const monogramNavyUrl = (): string => MONOGRAM_NAVY_URLS[brand()]

type BrandSvg = FC<SVGProps<SVGSVGElement>>

const WORDMARKS: Record<string, BrandSvg> = {
  marsh: MarshWordmark,
  mercer_a_marsh_business: MercerWordmark,
}

const MONOGRAMS: Record<string, BrandSvg> = {
  marsh: MarshMonogram,
  mercer_a_marsh_business: MercerMonogram,
}

export const wordmarkCurrentColor = (): BrandSvg => WORDMARKS[brand()]

export const monogramCurrentColor = (): BrandSvg => MONOGRAMS[brand()]

// Px, not rem: the legacy admin stylesheet roots at 12px while the end-user and auth apps root at 16px.
const MARK_HEIGHT = 28

const WORDMARK_HEIGHTS: Record<string, number> = {
  marsh: MARK_HEIGHT,
  mercer_a_marsh_business: 40,
}

export const wordmarkHeightPx = (): number => WORDMARK_HEIGHTS[brand()]

export const monogramHeightPx = (): number => MARK_HEIGHT
