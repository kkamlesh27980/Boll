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
