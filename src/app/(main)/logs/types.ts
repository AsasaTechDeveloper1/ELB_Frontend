export interface LogEntry {
  attemptedAuth: boolean;
  raisedByValid: any;
  date: any;
  authenticated: boolean;
  ddDate1: string;
  ddSign1: string;
  ddAuth1: string;
  id: number; // Client-side ID for log entry
  updated_id: string; // Client-side ID for log entry
  class: string;
  raisedBy: string;
  defectDetails: string; 
  mmsgFc: string;
  ata: string;
  sdr: boolean;
  actionDetails: string;
  ddChecked: boolean;
  ddAction: string;
  ddType: string;
  ddNo: string;
  melCdlRef: string;
  cat: string;
  indInspChecked: boolean;
  componentRows: ComponentRow[];
  shortSignAuthId: string;
  shortSignAuthName: string;
  actionAuthId: string;
  actionAuthName: string;
  logItemId?: string;   // Firestore log item ID
  createdAt?: string;   // ISO date string
  updatedAt?: string;   // ISO date string
}

export interface ComponentRow {
  partNo: string;
  serialOn: string;
  partOff: string;
  serialOff: string;
  grn: string;
  id?: string; // Firestore component ID
}

export interface AuthData {
  authId: string;
  authName: string;
  password: string;
  sign: string;
  date: string;
  expDate: string;
}
