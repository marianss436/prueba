/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Icons from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export function Icon({ name, className, size = 20 }: IconProps) {
  // Access the icon component by string key. Fallback to HelpCircle if not found.
  // @ts-ignore
  const LucideIcon = Icons[name] || Icons.HelpCircle || Icons.Coins;
  return <LucideIcon className={className} size={size} />;
}
