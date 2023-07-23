export interface FindAllInDayAvailableTimes {
  hour: number;
  available: boolean;
}

export interface FindAllInDayCourt {
  court: string;
  court_id: string;
  sport_type: string;
  available_times: FindAllInDayAvailableTimes[];
}

export interface FindAllInDayResponse {
  arena: string;
  arena_id: string;
  courts: FindAllInDayCourt[];
}
