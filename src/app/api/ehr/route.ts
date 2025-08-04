import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import EHR from "@/models/EHR";
import Appointment from "@/models/Appointment";
import { connectToDatabase } from "@/lib/mongodb";

// GET all EHR records (with optional patientId filter)
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    await connectToDatabase();
    
    const query = patientId ? { patientId } : {};
    const ehrRecords = await EHR.find(query)
      .sort({ visitDate: -1 })
      .populate("patientId", "firstName lastName")
      .populate("createdBy", "name");
    
    return NextResponse.json(ehrRecords);
  } catch (error) {
    console.error("Failed to fetch EHR records:", error);
    return NextResponse.json(
      { error: "Failed to fetch EHR records" },
      { status: 500 }
    );
  }
}

// POST create new EHR record
export async function POST(request: Request) {
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
    
    // Add the current user as the creator
    const ehrRecord = await EHR.create({
      ...body,
      createdBy: session.user.id,
      updatedBy: session.user.id,
    });

    // If this EHR is linked to an appointment, update the appointment with the EHR ID
    if (body.appointmentId) {
      const appointment = await Appointment.findById(body.appointmentId);
      if (appointment) {
        appointment.ehrId = ehrRecord._id;
        appointment.status = "completed";
        appointment.updatedBy = session.user.id;
        await appointment.save();
      }
    }

    return NextResponse.json(ehrRecord, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create EHR record:", error);
    return NextResponse.json(
      { error: "Failed to create EHR record" },
      { status: 500 }
    );
  }
}