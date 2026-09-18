#!/usr/bin/env python3
"""
One-off script: reads properties.csv (export from a different real-estate
system) and generates a SQL INSERT script that maps its columns onto this
app's `properties` table schema.

Usage: python3 scripts/generate-properties-import.py
Output: supabase/seed/import-properties.sql
"""
import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "properties.csv"
OUT_PATH = ROOT / "supabase" / "seed" / "import-properties.sql"


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def sql_str(value):
    if value is None:
        return "NULL"
    escaped = str(value).replace("'", "''")
    return f"'{escaped}'"


def sql_num(value):
    if value is None or value == "":
        return "NULL"
    return str(value)


def clean(value):
    if value is None:
        return None
    value = value.strip()
    if value == "" or value.upper() == "NULL":
        return None
    return value


def main():
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    used_slugs = set()
    values_sql = []
    skipped = 0

    for r in rows:
        if clean(r.get("deleted_at")) is not None:
            skipped += 1
            continue

        title = clean(r["title"]) or "Untitled property"
        code = clean(r["property_code"]) or r["id"]
        slug = f"{slugify(title)}-{slugify(code)}"
        base_slug = slug
        n = 2
        while slug in used_slugs:
            slug = f"{base_slug}-{n}"
            n += 1
        used_slugs.add(slug)

        description = clean(r.get("description"))
        price = clean(r.get("price")) or "0"
        listing_type = clean(r.get("offer_type")) or "sale"
        property_type = clean(r.get("property_type")) or "apartment"
        bedrooms = clean(r.get("bedrooms"))
        bathrooms = clean(r.get("bathrooms"))
        land_size = clean(r.get("land_area"))
        floor_area = clean(r.get("floor_area"))
        address = clean(r.get("location"))
        city = clean(r.get("city"))
        district = clean(r.get("district"))

        values_sql.append(
            "  ("
            f"{sql_str(title)}, {sql_str(slug)}, {sql_str(description)}, "
            f"{sql_num(price)}, 'LKR', {sql_str(listing_type)}, 'available', "
            f"{sql_str(property_type)}, {sql_num(bedrooms)}, {sql_num(bathrooms)}, "
            f"{sql_num(land_size)}, {sql_num(floor_area)}, {sql_str(address)}, "
            f"{sql_str(city)}, {sql_str(district)}, NULL, false, false"
            ")"
        )

    header = f"""-- Bulk import generated from properties.csv (source system export).
-- {len(values_sql)} rows imported, {skipped} soft-deleted rows in the source skipped.
-- Images are not available (source system's file paths aren't reachable from
-- here), so `images` is left NULL for every row -- add these manually per
-- listing via /admin/properties/[id]/edit.
-- All rows are imported as drafts (is_published = false) for review.

insert into public.properties
  (title, slug, description, price, currency, listing_type, status,
   property_type, bedrooms, bathrooms, land_size, floor_area, address,
   city, district, images, featured, is_published)
values
"""

    OUT_PATH.write_text(header + ",\n".join(values_sql) + ";\n")
    print(f"Wrote {len(values_sql)} rows to {OUT_PATH} ({skipped} skipped as soft-deleted)")


if __name__ == "__main__":
    main()
