export interface FindAllInDayAvailableTimes {
  hour: number;
  available: boolean;
}

export interface FindAllInDayCourt {
  court: string;
  court_id: string;
  sport_type: string;
  value_per_hour: number;
  available_times: FindAllInDayAvailableTimes[];
}

export interface FindAllInDayResponse {
  arena: string;
  arena_id: string;
  courts: FindAllInDayCourt[];
}
