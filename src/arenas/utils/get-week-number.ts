import { WeekDays } from '../opening-hours/enums/week-days.enum';

export function getWeekNumber(week_day: string) {
  let numberWeek;
  switch (week_day) {
    case 'SUNDAY':
      numberWeek = 0;
      break;
    case 'MONDAY':
      numberWeek = 1;
      break;
    case 'TUESDAY':
      numberWeek = 2;
      break;
    case 'WEDNESDAY':
      numberWeek = 3;
      break;
    case 'THURSDAY':
      numberWeek = 4;
      break;
    case 'FRIDAY':
      numberWeek = 5;
      break;
    case 'SATURDAY':
      numberWeek = 6;
      break;
  }

  return numberWeek;
}
