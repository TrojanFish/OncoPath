import httpx
import json

async def fetch_europe_pmc_studies(query: str, max_results: int = 5):
    """
    Search Europe PMC using their REST API and fetch article details.
    """
    url = "https://www.ebi.ac.uk/europepmc/webservices/rest/search"
    params = {
        "query": query,
        "format": "json",
        "resultType": "core",  # Core includes abstracts
        "pageSize": max_results
    }
    
    results = []
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            
            data = response.json()
            result_list = data.get("resultList", {}).get("result", [])
            
            for item in result_list:
                title = item.get("title", "")
                journal = item.get("journalTitle", "")
                
                # Extract year
                year_str = item.get("pubYear", "2024")
                try:
                    year = int(year_str)
                except ValueError:
                    year = 2024
                    
                authors = item.get("authorString", "Unknown")
                
                # Extract abstract
                abstract = item.get("abstractText", "")
                # Europe PMC returns abstract with HTML tags sometimes, strip basic ones or leave as is.
                # For simplicity, we just use it directly, but skip papers without abstract.
                if not abstract:
                    continue
                
                # Basic HTML stripping
                abstract = abstract.replace("<b>", "").replace("</b>", "").replace("<p>", "").replace("</p>", "")
                
                results.append({
                    "title": title,
                    "journal": journal,
                    "year": year,
                    "authors": authors,
                    "abstract": abstract
                })
                
        return results

    except Exception as e:
        print(f"Error fetching from Europe PMC: {e}")
        return []
