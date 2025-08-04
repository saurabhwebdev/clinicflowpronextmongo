import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get query parameters
    const url = new URL(request.url);
    const patientId = url.searchParams.get("patientId");
    const doctorId = url.searchParams.get("doctorId");
    const status = url.searchParams.get("status");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Build query
    const query: any = {};
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;
    if (status) query.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      query.dateTime = {};
      if (startDate) query.dateTime.$gte = new Date(startDate);
      if (endDate) query.dateTime.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query)
      .populate("patientId", "firstName lastName email phone")
      .populate("doctorId", "firstName lastName")
      .sort({ dateTime: 1 })
      .lean();

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    // Validate required fields
    if (!data.patientId || !data.dateTime) {
      return NextResponse.json(
        { error: "Patient ID and date/time are required" },
        { status: 400 }
      );
    }

    // Verify patient exists
    const patient = await User.findOne({ _id: data.patientId, role: 'patient' });
    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Verify doctor exists if provided
    if (data.doctorId) {
      const doctor = await User.findOne({ 
        _id: data.doctorId, 
        role: { $in: ['doctor', 'admin', 'master_admin'] } 
      });
      
      if (!doctor) {
        return NextResponse.json(
          { error: "Doctor not found" },
          { status: 404 }
        );
      }
    }

    // Create appointment
    const appointment = new Appointment({
      ...data,
      createdBy: session.user.id,
      updatedBy: session.user.id,
    });

    await appointment.save();

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}