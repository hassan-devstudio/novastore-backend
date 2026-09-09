import slugify from "slugify";
/**
 * Converts a product name into a URL-friendly slug.
 *
 * Example:
 *
 * Sony Wireless Headphones
 * ↓
 * sony-wireless-headphones
 */
const generateSlug = (name: string) => {
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });
};

export default generateSlug;
