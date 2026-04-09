export interface ConnectItem {
  id?: string;
  title: string;
  category: string;
  vault: { id: string };
  fields: ConnectField[];
  tags: string[];
}

export interface ConnectField {
  id: string;
  label: string;
  value: string;
  type: string;
  purpose?: string;
}
