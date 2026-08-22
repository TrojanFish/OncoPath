import json
from openai import AsyncOpenAI
from app.core.config import settings
from app.schemas.evidence import EvidenceResponse
from typing import List, Dict, Any

class AnalysisAgent:
    def __init__(self):
        # We initialize the OpenAI client with the provided config
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL
        )

    def _build_system_prompt(self) -> str:
        return """
You are OncoPath, an advanced Medical Evidence Interpretation Assistant designed for lung cancer patients.
Your primary role is to bridge the gap between complex pathology reports and evidence-based medicine, helping patients understand their condition without replacing their doctor.

STRICT MEDICAL SAFETY RULES:
1. NO DIAGNOSIS: You cannot diagnose or override a doctor's diagnosis.
2. NO PREDICTIONS: NEVER predict exact life expectancy (e.g., "You have 5 years to live"). You may mention survival rates from studies (e.g., "In a study of X patients, 99% remained recurrence-free at 5 years").
3. NO TREATMENT RECOMMENDATIONS: Do not recommend specific drugs or surgery types.
4. EVIDENCE TRACEABILITY: Every medical claim you make MUST be backed by the provided Evidence Context. You must cite the evidence.
5. EMPATHY: Be calm, reassuring, and objective. Avoid language that causes panic.
6. NO CASUAL EMOJIS: Do not use casual or cartoonish emojis (such as 🦀, 🫁, 💊, ⚠️, 🚨, 💉, 🏥) in any generated medical descriptions or recommendation strings. Use clean clinical phrasing, structured bullet points, and professional terminology.

Output Format MUST be a valid JSON matching this schema:
{
  "risk_level": "Low Risk" | "Intermediate Risk" | "High Risk",
  "key_findings": ["finding 1", "finding 2"],
  "evidence_summary": "A detailed explanation citing the provided literature",
  "recommendations": ["Question to ask your doctor 1", "Question 2"]
}
"""

    async def generate_report(self, profile: Dict[str, Any], evidences: List[EvidenceResponse]) -> str:
        """
        Generates the final report based on the patient profile and retrieved evidence.
        """
        # Format the evidence context
        evidence_context = "\n\n".join([
            f"Title: {e.title}\nJournal: {e.journal} ({e.year})\nSummary: {e.summary}\nConclusion: {e.conclusion}"
            for e in evidences
        ])

        user_prompt = f"""
Patient Pathology Profile:
{json.dumps(profile, indent=2)}

Retrieved Medical Evidence:
{evidence_context}

Based ONLY on the retrieved evidence and the patient profile, generate the JSON report. Do not include markdown formatting like ```json in the output, just the raw JSON object.
"""

        try:
            response = await self.client.chat.completions.create(
                model=settings.LLM_MODEL_NAME,
                messages=[
                    {"role": "system", "content": self._build_system_prompt()},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2, # Low temperature for more objective/consistent output
            )
            
            content = response.choices[0].message.content
            return content
        except Exception as e:
            # Fallback for when the API key is not yet configured or fails
            print(f"LLM Error: {e}")
            raise e
