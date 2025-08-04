import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Prescription from "@/models/Prescription";
import EHR from "@/models/EHR";
import { connectToDatabase } from "@/lib/mongodb";

// GET all prescription records (with optional patientId filter)
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const ehrId = searchParams.get("ehrId");
    const status = searchParams.get("status");

    await connectToDatabase();
    
    // Build query based on provided filters
    const query: any = {};
    if (patientId) query.patientId = patientId;
    if (ehrId) query.ehrId = ehrId;
    if (status) query.status = status;

    const prescriptions = await Prescription.find(query)
      .sort({ prescriptionDate: -1 })
      .populate("patientId", "firstName lastName")
      .populate("doctorId", "firstName lastName")
      .populate("createdBy", "firstName lastName");
    
    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error("Failed to fetch prescriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 }
    );
  }
}

// POST create new prescription
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
    const prescription = await Prescription.create({
      ...body,
      createdBy: session.user.id,
      updatedBy: session.user.id,
    });

    // If this prescription is linked to an EHR, update the EHR with the prescription ID
    if (body.ehrId) {
      const ehrRecord = await EHR.findById(body.ehrId);
      if (ehrRecord) {
        // Add the prescription ID to the EHR's prescriptionIds array if it doesn't already exist
        if (!ehrRecord.prescriptionIds) {
          ehrRecord.prescriptionIds = [];
        }
        
        if (!ehrRecord.prescriptionIds.includes(prescription._id)) {
          ehrRecord.prescriptionIds.push(prescription._id);
          ehrRecord.updatedBy = session.user.id;
          await ehrRecord.save();
        }
      }
    }

    return NextResponse.json(prescription, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create prescription:", error);
    return NextResponse.json(
      { error: "Failed to create prescription", details: error.message },
      { status: 500 }
    );
  }
}