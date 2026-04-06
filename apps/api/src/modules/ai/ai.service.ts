import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  
  private getClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'missing-key') {
        console.warn('[AIService] GEMINI_API_KEY is missing. AI features will fail.');
      }
      this.genAI = new GoogleGenerativeAI(apiKey || 'missing-key');
    }
    return this.genAI;
  }

  async getFeedback(
    problemName: string,
    problemDescription: string,
    code: string,
    language: string,
    verdict: string
  ): Promise<string> {
    const model = this.getClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Construct the prompt acting like an interviewer providing structural feedback
    const prompt = `You are an expert technical interviewer and programming mentor. Your goal is to help the candidate improve their code by providing **structural feedback, hints, and best practice suggestions**. 
    
DO NOT provide the full corrected code. Guide them to the solution instead.

Candidate's Problem:
Name: ${problemName}
Description: ${problemDescription}

Candidate's Submission Details:
Language: ${language}
Execution Verdict: ${verdict}  (AC means Accepted/Success; Anything else indicates an error/failure)

Candidate's Code:
\`\`\`${language}
${code}
\`\`\`

If the verdict is AC (Accepted):
- Congratulate them briefly.
- Analyze the time and space complexity of their solution.
- Suggest alternative approaches or structural improvements (e.g., cleaner code, better variables, more optimal data structures).

If the verdict is a failure or error:
- Point out potential logical flaws or edge cases they missed without giving away the exact lines of code to fix if possible.
- Provide a hint on what to look for or how to debug it.
- Suggest a structural refactor if their approach is fundamentally flawed.

Keep your response extremely concise, encouraging, and formatted in Markdown.
`;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      console.error('[AIService] Error calling Gemini API:', err.message);
      throw new Error('Failed to generate AI feedback. Please ensure GEMINI_API_KEY is properly set in backend .env');
    }
  }
}

export const aiService = new AIService();
