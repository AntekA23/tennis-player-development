import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserPermissions } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const teamId = cookieStore.get("teamId")?.value;

    if (!userId || !teamId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const permissions = await getUserPermissions(userId, teamId);

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}