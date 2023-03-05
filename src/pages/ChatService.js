import axios from "axios";


class ChatService {

    static async sendMessage(message) {
        return await axios.post("http://localhost:8080/api/chat",
                {
                    text: message
                },
                {
                    headers: {
                        'authorization': 'Bearer ' + localStorage.getItem('accessToken')
                    },
                    crossDomain: true
                }
        );
    }
}

export default ChatService;