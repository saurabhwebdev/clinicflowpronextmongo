import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

// GET all doctors
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find all users with role 'doctor'
    const doctors = await User.find({ role: "doctor" })
      .select("_id firstName lastName")
      .sort({ firstName: 1, lastName: 1 });

    console.log("Found doctors:", doctors.length, doctors); // Debug log
    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("Failed to fetch doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}