import OpenAI from "openai";
import { API_KEY } from "../config";

const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export { openai }