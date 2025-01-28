import { HfInference } from "@huggingface/inference";

const client = new HfInference(import.meta.env.VITE_HF);

export async function AIReply(userPrompt){
    const chatCompletion = await client.chatCompletion({
        model: "google/gemma-2-2b-it",
        messages: [
            {
                role: "user",
                content: `Stable Diffusion is an AI art generation model similar to DALLE-2.
Here are some prompts for generating art with Stable Diffusion. 

Example:

- A ghostly apparition drifting through a haunted mansion's grand ballroom, illuminated by flickering candlelight. Eerie, ethereal, moody lighting. 
- portait of a homer simpson archer shooting arrow at forest monster, front game card, drark, marvel comics, dark, smooth
- pirate, deep focus, fantasy, matte, sharp focus
- red dead redemption 2, cinematic view, epic sky, detailed, low angle, high detail, warm lighting, volumetric, godrays, vivid, beautiful
- a fantasy style portrait painting of rachel lane / alison brie hybrid in the style of francois boucher oil painting, rpg portrait
- athena, greek goddess, claudia black, bronze greek armor, owl crown, d & d, fantasy, portrait, headshot, sharp focus
- closeup portrait shot of a large strong female biomechanic woman in a scenic scifi environment, elegant, smooth, sharp focus, warframe
- ultra realistic illustration of steve urkle as the hulk, elegant, smooth, sharp focus
- portrait of beautiful happy young ana de armas, ethereal, realistic anime, clean lines, sharp lines, crisp lines, vibrant color scheme
- A highly detailed and hyper realistic portrait of a gorgeous young ana de armas, lisa frank, butterflies, floral, sharp focus
- lots of delicious tropical fruits with drops of moisture on table, floating colorful water, mysterious expression, in a modern and abstract setting, with bold and colorful abstract art, blurred background, bright lighting
- 1girl, The most beautiful form of chaos, Fauvist design, Flowing colors, Vivid colors, dynamic angle, fantasy world
- solo, sitting, close-up, girl in the hourglass, Sand is spilling out of the broken hourglass, flowing sand, huge hourglass art, hologram, particles, nebula, magic circle
- geometric abstract background, 1girl, depth of field, zentangle, mandala, tangle, entangle, beautiful and aesthetic, dynamic angle, glowing skin, floating colorful sparkles the most beautiful form of chaos, elegant, a brutalist designed, vivid colours, romanticism

The prompt should adhere to and include all of the following rules:

- Prompt should always be written in English, regardless of the input language. Please provide the prompts in English.
- Each prompt should consist of a description of the scene followed by modifiers divided by commas.
- When generating descriptions, focus on portraying the visual elements rather than delving into abstract psychological and emotional aspects. Provide clear and concise details that vividly depict the scene and its composition, capturing the tangible elements that make up the setting.
- The modifiers should alter the mood, style, lighting, and other aspects of the scene.
- Multiple modifiers can be used to provide more specific details.

I want you to write me a prompt exactly about the IDEA, following the rules. Only return the prompt as the response, nothing else.

IDEA: ${userPrompt}`
            }
        ],
        provider: "hf-inference",
        max_tokens: 500
    });
    const response = chatCompletion.choices[0].message.content;
    console.log(response);
    return response;
}

export async function generateImage(prompt){
    const image = await client.textToImage({
        model: "stabilityai/stable-diffusion-xl-base-1.0",
        inputs: prompt,
        parameters: { num_inference_steps: 100 },
        provider: "hf-inference",
    });
    return  URL.createObjectURL(image);
}


