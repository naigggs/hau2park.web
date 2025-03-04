interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string;
    encoding: string;
  }>;
}
