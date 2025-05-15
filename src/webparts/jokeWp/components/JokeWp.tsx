import * as React from "react";
import { useState } from "react";
import JokeService from "../Services/JokeService";

import styles from "./JokeWp.module.scss";

const RandomJoke: React.FC = () => {
    const [joke, setJoke] = useState<string>("Click the button to get a joke!");
    const [loading, setLoading] = useState<boolean>(false);

    const fetchJoke = async () => {
        setLoading(true);
        try {
            const fetchedJoke = await JokeService.getRandomJoke();
            setJoke(fetchedJoke);
        } catch (error) {
            setJoke("Oops! Couldn't fetch a joke. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.randomJoke}>
            <h2>Random Joke Generator</h2>
            <p>{joke}</p>
            <button onClick={fetchJoke} disabled={loading}>
                {loading ? "Fetching..." : "Get a Joke"}
            </button>
        </div>
    );
};

export default RandomJoke;