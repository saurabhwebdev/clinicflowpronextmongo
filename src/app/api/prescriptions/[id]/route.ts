import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Prescription from "@/models/Prescription";
import EHR from "@/models/EHR";
import { connectToDatabase } from "@/lib/mongodb";

// GET single prescription
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
    const prescription = await Prescription.findById(params.id)
      .populate("patientId", "firstName lastName")
      .populate("doctorId", "firstName lastName")
      .populate("ehrId")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");
    
    if (!prescription) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(prescription);
  } catch (error) {
    console.error("Failed to fetch prescription:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescription" },
      { status: 500 }
    );
  }
}

// PUT update prescription
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
    
    // Get the current prescription to check if ehrId is being changed
    const currentPrescription = await Prescription.findById(params.id);
    if (!currentPrescription) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 }
      );
    }

    // Handle EHR linking changes
    const oldEhrId = currentPrescription.ehrId?.toString();
    const newEhrId = body.ehrId?.toString();

    // Update the prescription
    const prescription = await Prescription.findByIdAndUpdate(
      params.id,
      { 
        ...body,
        updatedBy: session.user.id,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    // If ehrId has changed, update the EHR references
    if (newEhrId !== oldEhrId) {
      // If there was a previous EHR, remove this prescription from its list
      if (oldEhrId) {
        const oldEhr = await EHR.findById(oldEhrId);
        if (oldEhr && oldEhr.prescriptionIds) {
          oldEhr.prescriptionIds = oldEhr.prescriptionIds.filter(
            (id: any) => id.toString() !== params.id
          );
          await oldEhr.save();
        }
      }

      // If there's a new EHR, add this prescription to its list
      if (newEhrId) {
        const newEhr = await EHR.findById(newEhrId);
        if (newEhr) {
          if (!newEhr.prescriptionIds) {
            newEhr.prescriptionIds = [];
          }
          
          if (!newEhr.prescriptionIds.includes(prescription._id)) {
            newEhr.prescriptionIds.push(prescription._id);
            await newEhr.save();
          }
        }
      }
    }

    return NextResponse.json(prescription);
  } catch (error) {
    console.error("Failed to update prescription:", error);
    return NextResponse.json(
      { error: "Failed to update prescription" },
      { status: 500 }
    );
  }
}

// DELETE prescription
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
    if (!session.user?.role || !["doctor", "admin"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    
    // Get the prescription to check if it's linked to an EHR
    const prescription = await Prescription.findById(params.id);
    
    if (!prescription) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 }
      );
    }

    // If linked to an EHR, remove the reference
    if (prescription.ehrId) {
      const ehrRecord = await EHR.findById(prescription.ehrId);
      if (ehrRecord && ehrRecord.prescriptionIds) {
        ehrRecord.prescriptionIds = ehrRecord.prescriptionIds.filter(
          (id: any) => id.toString() !== params.id
        );
        await ehrRecord.save();
      }
    }

    // Delete the prescription
    await Prescription.findByIdAndDelete(params.id);
    
    return NextResponse.json({ message: "Prescription deleted successfully" });
  } catch (error) {
    console.error("Failed to delete prescription:", error);
    return NextResponse.json(
      { error: "Failed to delete prescription" },
      { status: 500 }
    );
  }
}