/**
 * A character's wardrobe holds more than clothing — shoes, bags and jewellery
 * live there too. Some people photograph an accessory with the outfit it goes
 * with; others keep each piece on its own. Both work: everything sits in the
 * same wardrobe, sorted by what kind of thing it is.
 *
 * `prefix` is how the piece introduces itself in a composed prompt.
 */
export const KINDS = [
  { id: "outfit", label: "Clothing", prefix: "Wearing" },
  { id: "shoes", label: "Shoes", prefix: "Shoes" },
  { id: "bag", label: "Bags", prefix: "Carrying" },
  { id: "jewellery", label: "Jewellery", prefix: "Jewellery" },
  { id: "other", label: "Other", prefix: "Also" },
];

/** Items saved before wardrobes had kinds are clothing. */
export const kindOf = (item) => item.kind || "outfit";

export const kindMeta = (id) => KINDS.find((k) => k.id === id) || KINDS[0];

export function groupByKind(items) {
  return KINDS.map((k) => ({
    ...k,
    items: (items || []).filter((i) => kindOf(i) === k.id),
  })).filter((g) => g.items.length > 0);
}
