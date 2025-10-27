import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "../../../lib/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

//transporter for nodemailer
export const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};


// Fetch user emails for announcements based on role
async function getUserEmailsForAnnouncement(role) {
  const usersCol = collection(db, "users");
  const emails = [];
  try {
    let userQuery;
    if (role === "all") {
      // Correctly query for ALL users by not adding a where clause for role
      userQuery = query(usersCol);
    } else {
      // Query for users with a specific role ('user' or 'admin')
      userQuery = query(usersCol, where("role", "==", role));
    }
    const userSnapshot = await getDocs(userQuery);
    userSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.email) {
        emails.push(userData.email);
      }
    });
  } catch (error) {
    console.error("Error fetching user emails for announcement:", error);
  }
  return emails;
}


export async function POST(request) {
  try {
    const { to, role, subject, message, type } = await request.json();

    // Validate required fields
    if (!subject || !message || !to) {
      return NextResponse.json(
        { error: "Subject, message, and recipient are required" },
        { status: 400 }
      );
    }

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        { error: "Email credentials not configured" },
        { status: 500 }
      );
    }

    let recipientEmails = [];

    // Correctly determine the recipients based on the 'to' field type
    if (Array.isArray(to)) {
      // This handles Direct Mail, where 'to' is an array of one or more emails
      recipientEmails = to;
    } else if (to === 'all') {
      // This handles Announcements, where 'to' is the string 'all'
      recipientEmails = await getUserEmailsForAnnouncement(role);
    } else if (typeof to === 'string' && to.includes('@')) {
        // Fallback for a single email string
        recipientEmails = [to];
    }

    if (recipientEmails.length === 0) {
      return NextResponse.json(
        { error: "No recipients found for the given criteria" },
        { status: 404 }
      );
    }

    const transporter = createTransporter();
    await transporter.verify();

    // Prepare email options
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Abhyas Platform'}" <${process.env.EMAIL_USER}>`,
      to: recipientEmails.join(','),
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #4f46e5; color: white; padding: 20px;">
            <h2 style="margin: 0;">
              ${type === 'announcement' ? '📢 Announcement' : '💬 Direct Message'}
            </h2>
          </div>
          <div style="padding: 20px;">
            <p style="color: #334155; line-height: 1.6; margin: 0;">
              ${message.replace(/\n/g, '<br>')}
            </p>
          </div>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              This is an automated message from the Abhyas Platform.
            </p>
          </div>
        </div>
      `
    };


    // Send email
    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      recipientCount: recipientEmails.length,
      recipients: recipientEmails,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
