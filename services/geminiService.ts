
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PlannerState } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

export const generateLessonContent = async (state: PlannerState): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isDll = state.format.includes('Log');
  const is7E = state.format.includes('7E');
  const combinedReference = state.referenceFiles.map(f => `FILE: ${f.name}\nCONTENT: ${f.content}`).join('\n\n---\n\n');

  const topicsDescription = isDll 
    ? `WEEKLY THEME: ${state.topic}`
    : state.numPlans > 1 
      ? state.subTopics.map((t, i) => `Plan ${i+1} Topic: ${t || 'Progressive topic'}`).join('\n')
      : `DAILY TOPIC: ${state.topic}`;

  const prompt = `
    TASK: GENERATE ${state.format.toUpperCase()}
    
    METADATA:
    School: ${state.school}
    Teacher: ${state.teacher}
    Grade: ${state.gradeLevel}
    Subject: ${state.subject}
    
    TOPIC CONTEXT:
    ${topicsDescription}
    
    REFERENCE DOCUMENTS:
    ${combinedReference ? combinedReference.substring(0, 45000) : 'None. Use DepEd K-12 Curriculum Standards.'}
    
    LANGUAGE MANDATE:
    1. Check the language of 'REFERENCE DOCUMENTS'. If Filipino, generate EVERYTHING in Filipino.
    2. Translate all component headers to formal Filipino DepEd terms.
    
    SPECIAL REQUIREMENTS:
    - **FOR ALL DLPs**: Explicitly add "Interdisciplinary Integration" and "Intradisciplinary Integration" as dedicated rows in the content table before the Procedures.
    - **FOR ALL 7E FRAMEWORKS (DLP or DLL)**: Ensure the **Explain** section is significantly lengthened and contains comprehensive, detailed explanations of the key concepts.
    - **FOR ALL 4A FRAMEWORKS (DLP or DLL)**: Ensure the **Abstraction** section is significantly lengthened and detailed.
    - **CRITICAL**: For DLP, ensure the Analysis/Abstraction or Explain parts (depending on framework) are highly detailed and incorporate specific discussion points.
    - **DLP FORMAT RULE**: For strategy components, DO NOT use the prefix "Procedure:" or "Procedures:".
    
    FORMAT SPECIFICS:
    - ${isDll ? 'DLL: 5-day progression (MONDAY to FRIDAY) in a 6-column table.' : 'DLP: Detailed vertical plan for ONE day.'}
    - Standards: Content Standard, Performance Standard, Learning Competencies.
    - Objectives: List Cognitive, Psychomotor, and Affective objectives separately.
    - Procedures: MUST follow the assigned strategy (${is7E ? '7Es: Elicit, Engage, Explore, Explain, Elaborate, Evaluate, Extend' : '4As: Review, Motivation, Activity, Analysis, Abstraction, Application'}).
    
    CONSTRAINTS:
    1. TWO TABLES ONLY.
    2. NO LATEX. Use Unicode for math.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.6,
      },
    });

    if (!response.text) throw new Error("AI returned no content.");
    return response.text;
  } catch (error: any) {
    throw new Error(error.message || "An error occurred during communication with the AI.");
  }
};
