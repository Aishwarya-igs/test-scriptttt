import { logger } from "./logger.js";

// utils/yopmail.ts
const easyYopmail = require('easy-yopmail');

interface GetOtpOptions {
  timeoutMs?: number;
  pollIntervalMs?: number;
  otpRegex?: RegExp;
  subjectContains?: string | null;
}

interface InboxMail {
  id: string;
  from: string;
  subject: string;
  timestamp: string;
  page: number;
}

interface ReadMessageResult {
  id: string;
  submit: string;
  from: string;
  date: string;
  content: string;
  [key: string]: any;
}

export async function getRandomYopmailAddress(): Promise<string> {
  const email: string = await easyYopmail.getMail();
  return email;
}
export async function clearYopmailInbox(mailUsername: string): Promise<void> {
  const fullMail = `${mailUsername}@yopmail.com`;
  await easyYopmail.deleteInbox(fullMail);
}

export async function getOtpFromYopmail(
  mailUsername: string,
  options: GetOtpOptions = {}
): Promise<string> {
  const {
    timeoutMs = 25000,
    pollIntervalMs = 3000,
    otpRegex = /requested is (\d{6})/,
    subjectContains = null,
  } = options;

  const fullMail = `${mailUsername}@yopmail.com`;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const { inbox }: { inbox: InboxMail[] } = await easyYopmail.getInbox(fullMail);

    if (inbox && inbox.length > 0) {
      const target = subjectContains
        ? inbox.find(m => m.subject?.toLowerCase().includes(subjectContains.toLowerCase()))
        : inbox[0];

      if (target) {
        const message: ReadMessageResult = await easyYopmail.readMessage(fullMail, target.id);
        const match = message.content.match(otpRegex);

        if (match) {
          const otp = match[1] ?? match[0];
          logger.info(`The OTP code you requested is: ${otp}`);
          return otp;
        }
      }
    }

    await new Promise(res => setTimeout(res, pollIntervalMs));
  }

  throw new Error(`OTP not found in ${fullMail} within ${timeoutMs}ms`);
}