export interface IUser {
  UserId: string;
  EmailAddress: string;
  FirstName: string;
  LastName: string;
  Status: string;
  Enabled: boolean;
  LastLogin: string | null;
  PhoneMobile: string | null;
  CompanyId: string;
}
