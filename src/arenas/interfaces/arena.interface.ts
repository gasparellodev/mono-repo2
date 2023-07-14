export interface IArena {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  is_validated?: Date;
  opening_time?: Date;
  closing_time?: Date;
  owner_id: string;
  address_id: string;
}
