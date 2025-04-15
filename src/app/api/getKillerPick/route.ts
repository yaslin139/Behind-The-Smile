import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const KillerPick = z.object({
  name: z.string(),
  description: z.string(),
  reason: z.string(),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body;

    const userAnswersText = answers.map(ans => `Question: ${ans.question}\nAnswer: ${ans.answer}`).join('\n\n');

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
You are a world-renowned psychologist with deep knowledge of both fictional and real serial killers. 
Given a set of user quiz answers, identify which serial killer (fictional or real) the user most resembles, 
and return only valid JSON (no extra text) matching this schema:

{
  "name": string, 
  "description": string, 
  "reason": string
}

Consider ALL answers to find the best match based on personality, quirks, and attributes. Be sensitive to 
even the smallest mismatches—aim for the perfect fit, including niche or lesser-known killers. Ask yourself: 
which serial killer would give these exact answers?

The "description" should summarize the killer’s background, methods, and notable traits.
The "reason" should explain how they align with the killer’s traits in second person, without directly 
referencing the answers.

Consider all killers from the list below, including lesser-known ones, and decide which is most aligned to the answers.

Here’s the list of killers to consider:
- Real: Ted Bundy, Jeffrey Dahmer, Richard Ramirez, John Wayne Gacy, Ed Gein, Jack the Ripper, 
  The Zodiac Killer, Gary Ridgway, Aileen Wuornos, Albert Fish, David Berkowitz, Dennis Rader, 
  Richard Chase, Pedro Alonso Lopez, Robert Pickton, Andréi Chikatilo, Edmund Kemper, Christopher Dorner, 
  Gary Heidnik, Jack Unterweger
- Fictional: Joe Goldberg, Michael Myers, Leatherface, Hannibal Lecter, John Kramer, Ghostface, 
  Norman Bates, Chucky, Buffalo Bill, Freddy Krueger, Jason Voorhees, The Tooth Fairy, Anton Chigurh, 
  Max Cady, The Creeper, John Doe, The Mayor, Tommy Jarvis

Map answers to traits like:
- Social behavior: Introverted killers (e.g., Jeffrey Dahmer, Norman Bates) prefer isolation; extroverted ones 
  (e.g., Ted Bundy) thrive on charm or manipulation.
- Emotional responses: Calmness (e.g., Hannibal Lecter, Dennis Rader) vs. impulsiveness (e.g., Richard Ramirez).
- Motivations: Control (e.g., John Kramer) vs. chaos (e.g., The Zodiac Killer).

Consider all killers from the examples, including lesser-known ones, and decide which is most aligned.

Do not default to well-known killers like Hannibal Lecter, Ted Bundy, Joe Goldberg unless the answers strongly align. 
Prioritize the best fit across all answers, ensuring a diverse and niche range of outcomes.
          `,
        },
        {
          role: "user",
          content: `Here are the user's quiz answers:\n\n${userAnswersText}\n\nBased on these, determine the serial killer they most resemble.`,
        },
      ],
      response_format: zodResponseFormat(KillerPick, "killerPick"),
    });

    const killerPick = completion.choices[0].message.parsed;
    console.log("Parsed killer pick:", killerPick);

    return NextResponse.json(killerPick);
  } catch (err: unknown) {
    console.error("Error in getKillerPick route:", err);
    return NextResponse.json({ error: "Failed to get killer pick" }, { status: 500 });
  }
}