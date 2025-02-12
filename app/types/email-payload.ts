interface EmailPayload {
    to: string;
    subject: string;
    html: string;
    attachments?: {
      filename: string;
      content: string;
      encoding: string;
    }[];
  }