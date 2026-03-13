from datetime import date, timedelta
from typing import List


def get_scheduled_dates(
    start_date: date,
    available_days: List[str],
    total_lessons: int
) -> List[date]:
    """
    Given a start date, available days, and total lesson count,
    returns an ordered list of calendar dates skipping unavailable days.
    
    Example:
        available_days = ["monday", "wednesday", "friday"]
        total_lessons = 6
        Returns 6 dates that fall only on Mon/Wed/Fri from start_date
    """

    DAY_MAP = {
        "monday": 0,
        "tuesday": 1,
        "wednesday": 2,
        "thursday": 3,
        "friday": 4,
        "saturday": 5,
        "sunday": 6
    }

    available_day_numbers = [DAY_MAP[d.lower()] for d in available_days]

    scheduled_dates = []
    current = start_date

    while len(scheduled_dates) < total_lessons:
        if current.weekday() in available_day_numbers:
            scheduled_dates.append(current)
        current += timedelta(days=1)

    return scheduled_dates



def get_next_available_date(from_date: date, available_days: List[str]) -> date:
    """
    Given a date, find the next calendar date
    that falls on an available day.

    Example:
        from_date = Wednesday
        available_days = ["tuesday", "thursday"]
        returns Thursday
    """
    DAY_MAP = {
        "monday": 0,
        "tuesday": 1,
        "wednesday": 2,
        "thursday": 3,
        "friday": 4,
        "saturday": 5,
        "sunday": 6
    }

    available_day_numbers = [DAY_MAP[d.lower()] for d in available_days]

    next_date = from_date + timedelta(days=1)

    while next_date.weekday() not in available_day_numbers:
        next_date += timedelta(days=1)

    return next_date