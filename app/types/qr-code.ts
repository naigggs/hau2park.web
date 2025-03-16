interface QRCode {
  used_at: React.JSX.Element | ((used_at: React.JSX.Element) => React.ReactNode);
  appointment_date: string | number | Date | React.JSX.Element;
  status: string;
  id: number;
  user_id: string;
  secret_key: string;
  is_used: boolean;
  qr_code_url: string;
  created_at: string;
}
