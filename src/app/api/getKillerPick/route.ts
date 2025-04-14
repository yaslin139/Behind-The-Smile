import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const KillerPick = z.object({
  name: z.string(),
  description: z.string(),
  reason: z.string(),
});

// 2) Initialize OpenAI with your key from .env
//    (Set OPENAI_API_KEY in your .env file)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // The user's answers (string[]) and maybe the question texts if needed
    const { answers } = body;

    // 3) Build your prompt or system instructions
    // We’ll feed in the user answers as context. You can shape this however you want.
    // IMPORTANT: With zodResponseFormat, the model must return valid JSON that matches the KillerPick schema.
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o", // or whichever model you want
      messages: [
        {
          role: "system",
          content: `
You are a world-renowned psychologist with deep knowledge of both fictional and real serial killers. 
Given a set of user quiz answers, you will identify which serial killer (fictional or real) 
the user most resembles, and return only valid JSON (no extra text) that matches this schema:

Zod schema for the final structured killer pick
{
  "name": string, 
  "description": string, 
  "reason": string
}

Consider ALL answers the user provides, to find a best match with a serial killer based on personality.

The "description" should be a summary of the killer's background, methods, and notable traits.
The "reason" should descriptively explain how they align with the killer's traits in second person, without directly referencing answers.
        `,
        },
        {
          role: "user",
          content: `The user's answers are: ${JSON.stringify(answers)}`,
        },
      ],
      // 4) Use zodResponseFormat to enforce structured JSON
      response_format: zodResponseFormat(KillerPick, "killerPick"),
    });

    // 5) Grab the parsed object from the response
    const killerPick = completion.choices[0].message.parsed;

    // 6) Return the structured JSON to the client
    return NextResponse.json(killerPick);
  } catch (err: unknown) {
    console.error("Error in getKillerPick route:", err);
    return NextResponse.json({ error: "Failed to get killer pick" }, { status: 500 });
  }
}

// Real-Life Serial Killers (20)

// Ted Bundy
// Jeffrey Dahmer
// Richard Ramirez (The Night Stalker)
// John Wayne Gacy
// Ed Gein
// Jack the Ripper
// The Zodiac Killer
// Gary Ridgway (The Green River Killer)
// Aileen Wuornos
// Albert Fish
// David Berkowitz (Son of Sam)
// Dennis Rader (BTK Killer)
// Richard Chase (The Vampire of Sacramento)
// Pedro Alonso Lopez (The Monster of the Andes)
// Robert Pickton
// Andréi Chikatilo (The Butcher of Rostov)
// Edmund Kemper
// Christopher Dorner
// Gary Heidnik
// Jack Unterweger

// Fictional Serial Killers (20)

// Joe Goldberg (You)
// Michael Myers (Halloween)
// Leatherface (The Texas Chainsaw Massacre)
// Hannibal Lecter (Silence of the Lambs)
// John Kramer (Jigsaw)
// Ghostface (Scream)
// Norman Bates (Psycho)
// Chucky (Child's Play)
// Buffalo Bill (The Silence of the Lambs)
// Freddy Krueger (A Nightmare on Elm Street)
// Jason Voorhees (Friday the 13th)
// The Tooth Fairy (Red Dragon)
// Anton Chigurh (No Country for Old Men)
// Max Cady (Cape Fear)
// The Creeper (Jeepers Creepers)
// John Doe (Se7en)
// The Mayor (The Walking Dead)
// Tommy Jarvis (Friday the 13th)