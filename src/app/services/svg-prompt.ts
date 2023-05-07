export const DefaultPrompt = `Follow the steps below to generate SVG code to fulfill my requirement which is delimited with triple backticks.

- Requirement: \`\`\`{input}\`\`\`
- Keywords: extract the keywords in the requirement. These keywords should be very helpful for generating the final SVG image.
- Reasoning: explain how to use svg codes to fulfil these keywords. Format your reasoning as the unordered list. Make your reasoning using the same language as the requirement.
- SVG: generate the SVG code to fulfil the requirement refer to your reasoning.

Format your response as a JSON object with "Keywords", "Reasoning", and "SVG" as the keys.
Format "Keywords" value as string arrays.
Format "Reasoning" value as a string.

Ensure the response contains only the JSON object.
`;

export const GivenSVGPrompt = `Given the original SVG code and original reasoning. 

- Original SVG: {svg}
- Original Reasoning: {reasoning}

Follow the steps below to update SVG code to fulfil my requirement which is delimited with triple backticks.

- Requirement: \`\`\`{input}\`\`\`
- Keywords: extract the keywords in the requirement. These keywords should be very helpful for generating the final SVG image.
- Reasoning: explain how to use svg codes to fulfil these keywords. Format your reasoning as the unordered list. Make your reasoning using the same language as the requirement.
- SVG: generate the SVG code to fulfil the requirement refer to your reasoning.

Format your response as a JSON object with "Keywords", "Reasoning", and "SVG" as the keys.
Format "Keywords" value as string arrays.
Format "Reasoning" value as a string.

Ensure the response contains only the JSON object.
`;
