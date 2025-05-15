import { FetchClient } from "@pnp/common";

class JokeService {
    private static apiUrl: string = "https://v2.jokeapi.dev/joke/Programming";

    public static async getRandomJoke(): Promise<string> {
        const fetchClient = new FetchClient();
        try {
            const response = await fetchClient.fetch(this.apiUrl,{method: "GET"});
            const data = await response.json();

            if (data.type === "single") {
                return data.joke; // Single-line joke
            } else {
                return `${data.setup} - ${data.delivery}`; // Two-part joke
            }
        } catch (error) {
            console.error("Error fetching joke:", error);
            throw new Error("Failed to fetch joke. Please try again later.");
        }
    }
}

export default JokeService;