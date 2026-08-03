import asyncio
from Bio import Entrez
import json

# Set email for NCBI E-utilities (required by NCBI guidelines)
Entrez.email = "bot@oncopath.com"

async def fetch_pubmed_studies(query: str, max_results: int = 5):
    """
    Search PubMed using E-utilities and fetch article details.
    This is an MVP version running in Python.
    """
    # 1. Search PubMed
    try:
        # Run synchronous Entrez calls in a thread pool to avoid blocking asyncio
        handle = await asyncio.to_thread(Entrez.esearch, db="pubmed", term=query, retmax=max_results)
        record = await asyncio.to_thread(Entrez.read, handle)
        handle.close()
        id_list = record.get("IdList", [])
        
        if not id_list:
            return []

        # 2. Fetch details for the IDs
        fetch_handle = await asyncio.to_thread(Entrez.efetch, db="pubmed", id=",".join(id_list), retmode="xml")
        articles = await asyncio.to_thread(Entrez.read, fetch_handle)
        fetch_handle.close()

        results = []
        for article in articles.get("PubmedArticle", []):
            medline = article.get("MedlineCitation", {})
            article_data = medline.get("Article", {})
            
            title = article_data.get("ArticleTitle", "")
            
            # Extract journal
            journal_info = article_data.get("Journal", {})
            journal = journal_info.get("Title", "")
            
            # Extract year
            pub_date = journal_info.get("JournalIssue", {}).get("PubDate", {})
            year = pub_date.get("Year", "2024") # Fallback to current year
            
            # Extract Abstract
            abstract = ""
            abstract_texts = article_data.get("Abstract", {}).get("AbstractText", [])
            if abstract_texts:
                abstract = " ".join(str(t) for t in abstract_texts)
            else:
                continue # Skip papers without abstracts for the MVP

            # Extract Authors (simplified)
            author_list = article_data.get("AuthorList", [])
            authors = "Unknown"
            if author_list:
                first_author = author_list[0]
                last_name = first_author.get("LastName", "")
                initials = first_author.get("Initials", "")
                authors = f"{last_name} {initials}, et al."

            results.append({
                "title": title,
                "journal": journal,
                "year": int(year) if year.isdigit() else 2024,
                "authors": authors,
                "abstract": abstract
            })
            
        return results

    except Exception as e:
        print(f"Error fetching from PubMed: {e}")
        return []
