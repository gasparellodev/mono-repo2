export interface CreateReservationResponse {
  id: string;
  date: Date;
  court: string;
  court_id: string;
  sport_type: string;
  arena: string;
  arena_id: string;
  status: string;
  link?: string;
}
