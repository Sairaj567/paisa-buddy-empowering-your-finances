export const parseFlexibleDate = (raw: string): Date | null => {
  if (!raw) return null;

  // Handle DD-MM-YYYY and DD/MM/YYYY formats from bank CSV imports.
  const splitBySlash = raw.split("/");
  const splitByDash = raw.split("-");

  if (splitBySlash.length === 3 && splitBySlash[2].length === 4) {
    const [dd, mm, yyyy] = splitBySlash;
    const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  if (splitByDash.length === 3) {
    if (splitByDash[0].length === 4) {
      const [yyyy, mm, dd] = splitByDash;
      const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }

    if (splitByDash[2].length === 4) {
      const [dd, mm, yyyy] = splitByDash;
      const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }

  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};
