class DigitalAssistant {
    constructor() {
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        
        this.initSpeechRecognition();
        this.initEventListeners();
    }

    initSpeechRecognition() {
        this.recognition.lang = 'hi-IN';
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            this.processCommand(command);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };
    }

    initEventListeners() {
        document.getElementById('micButton').addEventListener('click', () => {
            this.toggleListening();
        });
    }

    toggleListening() {
        if(this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        } else {
            this.recognition.start();
            this.isListening = true;
            document.getElementById('responseText').textContent = "सुन रही हूँ...";
        }
    }

    async processCommand(command) {
        const responseBox = document.getElementById('responseText');
        responseBox.textContent = `आपने कहा: ${command}`;

        try {
            if(command.includes('कॉल')) {
                await this.handleCall(command);
            } 
            else if(command.includes('मैसेज')) {
                await this.handleMessage(command);
            }
            else if(command.includes('स्थान')) {
                await this.getLocation();
            }
            else {
                const answer = await AIService.getAnswer(command);
                this.speak(answer);
                responseBox.textContent = answer;
            }
        } catch(error) {
            console.error('Error:', error);
            this.speak("कुछ गड़बड़ हुई है, कृपया फिर कोशिश करें");
        }
    }

    async handleCall(command) {
        const number = command.replace('कॉल', '').trim();
        window.location.href = `tel:${number}`;
    }

    async handleMessage(command) {
        const [_, number, message] = command.match(/मैसेज ([\d]+) (.*)/) || [];
        if(number && message) {
            window.location.href = `sms:${number}?body=${encodeURIComponent(message)}`;
        }
    }

    async getLocation() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                this.speak(`आपका स्थान: अक्षांश ${lat}, देशांतर ${lon}`);
            });
        }
    }

    speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.9;
        this.synthesis.speak(utterance);
    }
}

// Initialize assistant
window.addEventListener('load', () => {
    window.assistant = new DigitalAssistant();
});
class DigitalAssistant {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.chatHistory = [];

        this.initSpeechRecognition();
        this.initEventListeners();
        this.checkSpeechSupport();
    }

    checkSpeechSupport() {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.initSpeechRecognition();
        } else {
            this.showMessage("सिस्टम संदेश", "आपका ब्राउज़र वॉइस सपोर्ट नहीं करता");
        }
    }

    initSpeechRecognition() {
        if(this.recognition) {
            this.recognition.lang = 'hi-IN';
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;

            this.recognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase();
                this.processInput(command, 'voice');
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showMessage("सिस्टम संदेश", "वॉइस समझने में त्रुटि");
            };
        }
    }

    initEventListeners() {
        // Mic Button
        document.getElementById('micButton').addEventListener('click', () => {
            this.toggleListening();
        });

        // Send Button
        document.getElementById('sendButton').addEventListener('click', () => {
            this.handleTextInput();
        });

        // Enter Key
        document.getElementById('userInput').addEventListener('keypress', (e) => {
            if(e.key === 'Enter') this.handleTextInput();
        });
    }

    handleTextInput() {
        const inputField = document.getElementById('userInput');
        const text = inputField.value.trim();
        
        if(text) {
            this.processInput(text, 'text');
            inputField.value = '';
        }
    }

    async processInput(input, inputType) {
        this.addMessage(input, 'user');
        
        try {
            let response;
            
            if(input.includes('कॉल')) {
                response = await this.handleCall(input);
            } 
            else if(input.includes('मैसेज')) {
                response = await this.handleMessage(input);
            }
            else if(input.includes('स्थान')) {
                response = await this.getLocation();
            }
            else {
                response = await AIService.getAnswer(input);
            }

            this.addMessage(response, 'bot');
            this.speak(response);
        } catch(error) {
            console.error('Error:', error);
            this.addMessage("कुछ गड़बड़ हुई है, कृपया फिर कोशिश करें", 'bot');
        }
    }

    addMessage(text, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = text;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Rest of the previous methods (handleCall, handleMessage, etc.) remain same
    // ... (Previous code for handleCall, handleMessage, etc.)

    toggleListening() {
        if(!this.recognition) {
            this.showMessage("सिस्टम संदेश", "वॉइस सपोर्ट उपलब्ध नहीं");
            return;
        }

        if(this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.showMessage("सिस्टम संदेश", "वॉइस रिकॉर्डिंग बंद");
        } else {
            this.recognition.start();
            this.isListening = true;
            this.showMessage("सिस्टम संदेश", "सुन रही हूँ...");
        }
    }

    showMessage(title, content) {
        const message = `${title}: ${content}`;
        this.addMessage(message, 'bot');
    }

    // Rest of the previous methods remain same
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Initialize assistant
window.addEventListener('load', () => {
    window.assistant = new DigitalAssistant();
});
