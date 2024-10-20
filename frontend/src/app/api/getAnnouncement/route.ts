import { connectToDB } from "@/lib/connectdb";
import { NextResponse } from "next/server";
import { Announcment } from "./../../../../../models/Announcement";

export async function GET() {
  try {
    const conn = await connectToDB();

    const announcements = await Announcment.find();

    console.log("Connected to database");

    return NextResponse.json({ message: "Connected to database", status: 200, data: announcements });
  } catch (error) {
    console.error("Error in getAnnouncement route", error);
  }
}
