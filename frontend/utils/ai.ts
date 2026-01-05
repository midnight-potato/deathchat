import z, { toJSONSchema } from "zod";

const { HACKCLUB_AI_KEY } = process.env;

export const CheckDeathThreatSchema = z.object({
  has_death_threat: z.boolean(),
  reasoning: z.string(),
});

export async function checkDeathThreat(message: string) {
  const res = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HACKCLUB_AI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen/qwen3-32b",
      messages: [
        {
          role: "system",
          content:
            `You are an AI whose job is to check if a message contains a death threat. You will receive one line of input, 
            which is the message to check. You should output a JSON object that identifies whether there is a death threat 
            or not, and one sentence on why you think so, in the following format: {"threat": boolean, "reason": string}
            where \`threat\` is true/false depending on whether the message contains a death threat, and \`reason\` is your
            justification for the decision. You may not output in any other format or with any other content. If it is 
            indesicive or an error occurs, return threat as false and reason as "ERROR: [short description of the reason
            for returning error]".`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "death_threat_detection",
          strict: true,
          schema: toJSONSchema(CheckDeathThreatSchema),
        },
      },
    }),
  }).then((r) => r.json());

  const response = res?.choices?.[0]?.message?.content;
  if (!response) {
    throw new Error(`API returned invalid result: ${JSON.stringify(res)}`);
  }

  return JSON.parse(response) as z.infer<typeof CheckDeathThreatSchema>;
}
