import logging
from typing import List, Dict
from ddgs import DDGS

logger = logging.getLogger(__name__)


def get_reference_links(skill: str, topic: str) -> List[Dict[str, str]]:
    """
    Searches DuckDuckGo for official documentation links
    for a given skill and topic.

    Returns top 3 results as list of {label, url} dicts.
    
    Example:
        skill = "Python"
        topic = "Inheritance"
        query = "Python Inheritance official documentation"
        Returns: [{"label": "...", "url": "..."}, ...]
    """

    query = f"{skill} {topic} official documentation"
    results = []

    try:
        with DDGS() as ddgs:
            search_results = ddgs.text(query, max_results=3)
            for r in search_results:
                results.append({
                    "label": r["title"],
                    "url": r["href"]
                })
    except Exception as e:
        logger.error(f"DuckDuckGo search failed for '{query}': {str(e)}")
        results = []

    return results