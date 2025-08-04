import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import EHR from "@/models/EHR";
import { connectToDatabase } from "@/lib/mongodb";

// GET single EHR record
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const ehrRecord = await EHR.findById(params.id)
      .populate("patientId", "firstName lastName")
      .populate("prescriptionIds")
      .populate("createdBy", "name")
      .populate("updatedBy", "name");
    
    if (!ehrRecord) {
      return NextResponse.json(
        { error: "EHR record not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(ehrRecord);
  } catch (error) {
    console.error("Failed to fetch EHR record:", error);
    return NextResponse.json(
      { error: "Failed to fetch EHR record" },
      { status: 500 }
    );
  }
}

// PUT update EHR record
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has appropriate role (doctor or admin)
    if (!session.user?.role || !["doctor", "admin"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    await connectToDatabase();
    
    const ehrRecord = await EHR.findByIdAndUpdate(
      params.id,
      { 
        ...body,
        updatedBy: session.user.id,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!ehrRecord) {
      return NextResponse.json(
        { error: "EHR record not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(ehrRecord);
  } catch (error) {
    console.error("Failed to update EHR record:", error);
    return NextResponse.json(
      { error: "Failed to update EHR record" },
      { status: 500 }
    );
  }
}

// DELETE EHR record
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has appropriate role (admin only)
    if (!session.user?.role || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const ehrRecord = await EHR.findByIdAndDelete(params.id);
    
    if (!ehrRecord) {
      return NextResponse.json(
        { error: "EHR record not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: "EHR record deleted successfully" });
  } catch (error) {
    console.error("Failed to delete EHR record:", error);
    return NextResponse.json(
      { error: "Failed to delete EHR record" },
      { status: 500 }
    );
  }
}