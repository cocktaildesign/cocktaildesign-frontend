// frontend/src/lib/api/mobile-navigation/types.ts

export type MobileNavigationItem = {
  title: string;
  href: string;
  homeImageUrl: string | null;
  menuImageUrl: string | null;
  showInHome: boolean;
  showInMenu: boolean;
  isActive: boolean;
};

export type StrapiMobileNavigationMedia = {
  url?: string | null;
} | null;

export type StrapiMobileNavigationItem = {
  title?: string | null;
  href?: string | null;
  homeImage?: StrapiMobileNavigationMedia;
  menuImage?: StrapiMobileNavigationMedia;
  showInHome?: boolean | null;
  showInMenu?: boolean | null;
  isActive?: boolean | null;
};

export type StrapiMobileNavigationData = {
  items?: StrapiMobileNavigationItem[] | null;
} | null;

export type StrapiMobileNavigationResponse = {
  data?: StrapiMobileNavigationData;
};
