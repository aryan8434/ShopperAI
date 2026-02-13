import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

export const getCategoryFromLLM = async (query) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for an e-commerce site. Your task is to categorize a search query into one of these exact categories: 'Electronics', 'Clothes', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Toys'. If the query doesn't fit within these specific categories, return 'None'. Return ONLY the category name, nothing else.",
        },
        {
          role: "user",
          content: `Categorize this search query: "${query}"`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0,
    });

    const category = completion.choices[0]?.message?.content?.trim();
    return category;
  } catch (error) {
    console.error("Error fetching category from LLM:", error);
    return null;
  }
};

export const getGroqCompletion = async (messages, systemPrompt) => {
  try {
    const formattedMessages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...messages,
    ];

    const completion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content?.trim();
  } catch (error) {
    console.error("Error fetching chat completion from Groq:", error);
    throw error;
  }
};
