// src/components/common/LocalizedLink.tsx
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ComponentProps, ReactNode } from 'react';

// Accept every prop Next's <Link> accepts (all anchor attributes, pointer
// events, aria-*), with href narrowed to a string we can localize.
type LocalizedLinkProps = Omit<ComponentProps<typeof Link>, 'href' | 'children'> & {
  href: string;
  children: ReactNode;
};

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