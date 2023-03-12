import axios from "axios";


class ChatService {

    static async sendMessage(message) {
        return await axios.post("http://localhost:8080/api/chat",
                {
                    text: message
                },
                {

                    crossDomain: true
                }
        );
    }
    static async findHistory(page, size) {
        return await axios.get("http://localhost:8080/api/chat",
            {
                params: {page: page, size: size}
            },
            {

                crossDomain: true
            }
        );
    }
    static async deleteMessage(messageId) {
        return await axios.delete("http://localhost:8080/api/chat/" + messageId,
                {},
                {

                    crossDomain: true
                }
        );
    }
}

export default ChatService;
