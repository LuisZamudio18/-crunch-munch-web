import IMAGES from '@/data/toppingImages.json';

const MAP = IMAGES as Record<string, string>;

function norm(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9&]+/g, ' ')
    .trim();
}

/**
 * Path of the product picture for a topping / flavour / menu item, or undefined when there is none.
 * Images live in public/toppings (one per distinct product; several names can share one picture).
 * `group` is the category or group label, used first so "Sandías" in Gomitas and "Sandía" in Smoothies differ.
 */
export function toppingImage(name: string, group?: string): string | undefined {
  const file = (group ? MAP[norm(`${group}:${name}`)] : undefined) ?? MAP[norm(name)];
  return file ? `/toppings/${file}` : undefined;
}
