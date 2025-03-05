import { NextResponse } from 'next/server';
import nodemailer, { SendMailOptions } from 'nodemailer';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Set up the transporter for sending emails
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Initialize mailOptions with a default empty object
    let mailOptions: SendMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Default to sending to your email (CEO)
      subject: '',
      html: ''
    };

    // Check if the data is for a business offer, job/internship, or feedback
    if (data.businessName) {
      // Business offer email template
      mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send email to your address (CEO)
        subject: 'New Business Offer Submission',
        html: `
          <h2>New Business Offer</h2>
          <p><strong>From:</strong> ${data.email}</p>
          <p><strong>Business Name:</strong> ${data.businessName}</p>
          <p><strong>Business Offer:</strong></p>
          <p>${data.businessOffer}</p>
        `
      };
    } else if (data.feedback) {
      // Feedback email template
      mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send email to your address (CEO)
        subject: 'New Feedback Submission',
        html: `
          <h2>New Feedback</h2>
          <p><strong>From:</strong> ${data.email}</p>
          <p><strong>Feedback:</strong></p>
          <p>${data.feedback}</p>
        `
      };
    } // In the job/internship section, change this:
    else if (data.role) {
      // Job/Internship request email template
      mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send email to your address (CEO)
        subject: 'New Job/Internship Request',
        html: `
          <h2>New Job/Internship Request</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Role:</strong> ${data.role}</p>
        `
      };
    }
    
    // To this:
    else if (data.jobRole) {
      // Job/Internship request email template
      mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send email to your address (CEO)
        subject: 'New Job/Internship Request',
        html: `
          <h2>New Job/Internship Request</h2>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Role:</strong> ${data.jobRole}</p>
          <p><strong>Job Interest:</strong> ${data.jobInterest}</p>
        `
      };
    }

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Submission successful' });
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json({ message: 'Error submitting the form' }, { status: 500 });
  }
}
