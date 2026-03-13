from datetime import date, datetime, timezone
from typing import List
from src.utils.data_utils import get_scheduled_dates


class ScheduleService:

    def assign_dates_to_lessons(
        self,
        lessons: list,
        start_date: date,
        available_days: List[str]
    ) -> list:
        """
        Takes raw lesson list from AI agent and assigns
        a scheduled_date to each lesson.
        Returns updated lesson list with scheduled_date added.
        """

        total = len(lessons)
        dates = get_scheduled_dates(start_date, available_days, total)

        for i, lesson in enumerate(lessons):
            lesson["scheduled_date"] = datetime.combine(
                dates[i],
                datetime.min.time()
            ).replace(tzinfo=timezone.utc)

        return lessons