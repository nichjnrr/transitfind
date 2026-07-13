// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { passwordResetEmail } from "@/lib/emails/passwordReset";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Always respond the same way, whether or not the email exists,
    // so we never reveal which emails have accounts.
    const genericResponse = NextResponse.json({
      message: "If that email has an account, a reset link has been sent.",
    });

    if (!email) return genericResponse;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return genericResponse;

    // Generate a random token; store only its hash.
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any earlier tokens for this user, then store the new one.
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { tokenHash, userId: user.id, expiresAt },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    const { subject, html } = passwordResetEmail({
      recipientName: user.name,
      resetUrl,
    });

    await resend.emails.send({
      from: "TransitFind <onboarding@resend.dev>",
      to: user.email,
      subject,
      html,
    });

    return genericResponse;
  } catch (error) {
    console.error("forgot-password error:", error);
    // Still return the generic message so nothing is leaked on error.
    return NextResponse.json({
      message: "If that email has an account, a reset link has been sent.",
    });
  }
}
