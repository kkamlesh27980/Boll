class AIService {
    static async getAnswer(question) {
        const API_KEY = 'YOUR_OPENAI_API_KEY';
        const url = 'https://api.openai.com/v1/chat/completions';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: `${question} (हिंदी में जवाब दें)`
                }]
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    }
}
