export interface IAvailableSchedule {
  name: string;
  schedules: ISchedule[];
}
export interface ISchedule {
  start_time: string;
  end_time: string;
  court: string;
  court_id: string;
}
