export enum BookType {
  INCOMING = 'وارد',
  OUTGOING = 'صادر',
}

export enum View {
  DASHBOARD = 'dashboard',
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
  USER_MANAGEMENT = 'user_management',
}

export interface BookFile {
  name: string;
  type: string;
  data: string; // Base64 encoded string
}

export interface Book {
  id: string;
  type: BookType;
  title: string;
  number: string;
  date: string;
  entity: string;
  subject: string;
  file?: BookFile;
}

export interface User {
  id: string;
  username: string;
  password: string; // Note: Storing passwords in plain text is insecure. For demonstration purposes only.
  role: 'admin' | 'user';
}
