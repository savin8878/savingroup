// src/components/common/LocalizedLink.tsx
'use client';

import Link, { LinkProps } from 'next/link';
import { useParams } from 'next/navigation';
import {
  CSSProperties,
  FocusEventHandler,
  KeyboardEventHandler,
  ReactNode,
} from 'react';

interface LocalizedLinkProps extends Omit<LinkProps, 'href'> {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;
  role?: string;
  tabIndex?: number;
  'aria-label'?: string;
  'aria-haspopup'?: boolean | 'true' | 'false' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-expanded'?: boolean;
  onFocus?: FocusEventHandler<HTMLAnchorElement>;
  onBlur?: FocusEventHandler<HTMLAnchorElement>;
  onKeyDown?: KeyboardEventHandler<HTMLAnchorElement>;
}

export default function LocalizedLink({
  href,
  children,
  className,
  style,
  ...props
}: LocalizedLinkProps) {
  const params = useParams();
  const country = params?.country as string | undefined;
  const locale = params?.locale as string | undefined;

  let prefix = '';
  if (country && locale) {
    prefix = `/${country.toLowerCase()}/${locale.toLowerCase()}`;
  }

  // Preserve absolute URLs, anchors, external links
  const finalHref =
    href.startsWith('http') ||
    href.startsWith('//') ||
    href.startsWith('#') ||
    href.startsWith('tel:') ||
    href.startsWith('mailto:')
      ? href
      : `${prefix}${href.startsWith('/') ? '' : '/'}${href}`;

  const cleaned = finalHref.replace(/\/{2,}/g, '/');

  return (
    <Link href={cleaned} className={className} style={style} {...props}>
      {children}
    </Link>
  );
}