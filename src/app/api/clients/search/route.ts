import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * criteria = "phone" | "email" | "address" | "wildcard"
 * query    = string
 *
 * NOTE: emails[] supports exact element matches (has: "user@site.com").
 * For partial email matches we can add a denormalized text column later.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const criteria = (searchParams.get("criteria") || "wildcard").toLowerCase();
    const query = (searchParams.get("query") || "").trim();
    if (!query) return NextResponse.json([]);

    const q = query.toLowerCase();
    const digits = q.replace(/\D+/g, "");

    let where: any;

    switch (criteria) {
      case "phone":
        where = {
          OR: [
            { workPhone1: { contains: digits } },
            { workPhone2: { contains: digits } },
            { cell:       { contains: digits } },
            { fax:        { contains: digits } },
          ],
        };
        break;

      case "email":
        where = {
          OR: [{ emails: { has: q } }], // exact element match
        };
        break;

      case "address":
        where = {
          OR: [
            { address1: { contains: q, mode: "insensitive" } },
            { address2: { contains: q, mode: "insensitive" } },
            { city:     { contains: q, mode: "insensitive" } },
            { state:    { contains: q, mode: "insensitive" } },
            { zip:      { contains: q, mode: "insensitive" } },
          ],
        };
        break;

      default: // wildcard
        where = {
          OR: [
            { companyName: { contains: q, mode: "insensitive" } },
            { address1:    { contains: q, mode: "insensitive" } },
            { address2:    { contains: q, mode: "insensitive" } },
            { city:        { contains: q, mode: "insensitive" } },
            { state:       { contains: q, mode: "insensitive" } },
            { zip:         { contains: q, mode: "insensitive" } },
            { workPhone1:  { contains: digits } },
            { workPhone2:  { contains: digits } },
            { cell:        { contains: digits } },
            { fax:         { contains: digits } },
            { emails:      { has: q } }, // full email match
          ],
        };
        break;
    }

    const rows = await prisma.client.findMany({
      where,
      orderBy: { companyName: "asc" },
      select: {
        id: true,
        companyName: true,
        address1: true,
        city: true,
        state: true,
        workPhone1: true,
        workPhone2: true,
        cell: true,
      },
      take: 50,
    });

    const map = rows.map((r) => ({
      id: r.id,
      name: r.companyName,
      address1: r.address1 ?? "",
      city: r.city ?? "",
      state: r.state ?? "",
      phone: r.workPhone1 || r.workPhone2 || r.cell || "",
      lastAppt: null,
    }));

    return NextResponse.json(map);
  } catch (err: any) {
    console.error("clients/search error", err);
    return NextResponse.json({ error: "search failed" }, { status: 500 });
  }
}
