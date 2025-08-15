export interface LogEntry {
  attemptedAuth: boolean;
  raisedByValid: any;
  date: any;
  authenticated: boolean;
  ddDate1: string;
  ddSign1: string;
  ddAuth1: string;
  id: number;
  class: string;
  raisedBy: string;
  defectDetails: string;
  mmsgFc: string;
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
}

export interface ComponentRow {
  partNo: string;
  serialOn: string;
  partOff: string;
  serialOff: string;
  grn: string;
}

export interface AuthData {
  authId: string;
  authName: string;
  password: string;
  sign: string;
  date: string;
  expDate: string;
}