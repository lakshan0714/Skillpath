import json
import logging
from openai import AsyncOpenAI
from src.utils.reference_fetcher import get_reference_links
from src.config.settings import Settings

logger = logging.getLogger(__name__)
settings = Settings()

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def generate_roadmap(
    skill: str,
    level: str,
    timeline_weeks: int,
    hours_per_day: int,
    available_days: list
) -> list:
    """
    Calls OpenAI to generate a structured lesson plan.
    Returns a list of lesson dicts.
    """

    days_str = ", ".join(available_days)
    total_days = timeline_weeks * len(available_days)

    prompt = f"""
You are an expert learning coach.

Create a structured learning plan for someone who wants to learn {skill}.

User details:
- Current level: {level}
- Available days per week: {days_str}
- Hours per day: {hours_per_day}
- Timeline: {timeline_weeks} weeks
- Total lessons needed: {total_days}

Rules:
- Generate exactly {total_days} lessons
- Group lessons into logical phases (e.g. Basics, Core Concepts, Projects)
- Each lesson should be completable in {hours_per_day} hour(s)
- Progress from easy to hard gradually
- Last phase should always be a mini project

Return ONLY a valid JSON array. No explanation, no markdown, no extra text.
Each item must have exactly these fields:
{{
    "day_number": 1,
    "topic": "topic name",
    "phase": "phase name",
    "difficulty": "easy" or "medium" or "hard",
    "estimated_minutes": number
}}
"""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a learning plan generator. Always return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        content = response.choices[0].message.content.strip()

        # Strip markdown if model wraps in ```json
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]

        lessons = json.loads(content)

        # Validate count
        if len(lessons) != total_days:
            logger.warning(f"Expected {total_days} lessons, got {len(lessons)}. Trimming or padding.")
            lessons = lessons[:total_days]

        return lessons

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse roadmap JSON: {e}")
        raise Exception("Roadmap generation failed — invalid JSON from AI")
    except Exception as e:
        logger.error(f"Roadmap agent error: {e}")
        raise Exception(f"Roadmap generation failed: {str(e)}")
    
