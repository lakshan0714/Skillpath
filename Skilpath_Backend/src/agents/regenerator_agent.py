import json
import logging
from openai import AsyncOpenAI
from src.config.settings import Settings
from src.utils.reference_fetcher import get_reference_links

logger = logging.getLogger(__name__)
settings = Settings()

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def regenerate_lesson(
    skill: str,
    topic: str,
    level: str
) -> dict:
    """
    Calls OpenAI to generate a simplified beginner-friendly lesson.
    Also fetches reference links via DuckDuckGo.
    Returns a structured lesson content dict.
    """

    prompt = f"""
You are a patient and friendly tutor.

A {level} learner is studying {skill} and found the topic "{topic}" confusing after studying it once.

Your job is to re-explain this topic in the simplest possible way.

Return ONLY a valid JSON object. No explanation, no markdown, no extra text.
The JSON must have exactly these fields:
{{
    "analogy": "a simple real world analogy to explain the concept",
    "explanation": "plain english explanation in 3-5 sentences",
    "code": "a minimal working code example as a string",
    "exercises": [
        "exercise 1 description",
        "exercise 2 description",
        "exercise 3 description"
    ]
}}
"""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a tutor. Always return valid JSON only."},
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

        lesson_content = json.loads(content)

        # Fetch reference links dynamically via DuckDuckGo
        references = get_reference_links(skill, topic)
        lesson_content["references"] = references

        return lesson_content

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse regenerated lesson JSON: {e}")
        raise Exception("Lesson regeneration failed — invalid JSON from AI")
    except Exception as e:
        logger.error(f"Regenerator agent error: {e}")
        raise Exception(f"Lesson regeneration failed: {str(e)}")
    

async def generate_lesson_content(
    skill: str,
    topic: str,
    level: str
) -> dict:
    """
    Generates lesson content for a normal pending lesson.
    Called when user opens a lesson for the first time.
    """

    prompt = f"""
You are an expert tutor teaching {skill}.

Teach the topic "{topic}" to a {level} learner.

Return ONLY a valid JSON object. No explanation, no markdown, no extra text.
The JSON must have exactly these fields:
{{
    "analogy": "a simple real world analogy to explain the concept",
    "explanation": "clear explanation in 4-6 sentences",
    "code": "a working code example as a string",
    "exercises": [
        "exercise 1 description",
        "exercise 2 description",
        "exercise 3 description"
    ]
}}
"""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a tutor. Always return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        content = response.choices[0].message.content.strip()

        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]

        lesson_content = json.loads(content)

        # Fetch reference links
        references = get_reference_links(skill, topic)
        lesson_content["references"] = references

        return lesson_content

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse lesson content JSON: {e}")
        raise Exception("Lesson content generation failed — invalid JSON from AI")
    except Exception as e:
        logger.error(f"Lesson content agent error: {e}")
        raise Exception(f"Lesson content generation failed: {str(e)}")