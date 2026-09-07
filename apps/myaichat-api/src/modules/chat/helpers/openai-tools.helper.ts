import { CreateImageGenerationTool, CreateWebSearchTool } from '../interfaces';

export const createToolParamsIfEnabled = (
  isWebSearch: boolean,
  isImageGeneration: boolean,
) => {
  const tools: Array<CreateImageGenerationTool | CreateWebSearchTool> = [];

  if (isImageGeneration) {
    const imageGenTool: CreateImageGenerationTool = {
      type: 'image_generation',
      size: '1024x1024',
      quality: 'medium',
      background: 'auto',
      input_fidelity: 'high',
    };
    tools.push(imageGenTool);
  }

  if (isWebSearch) {
    const webSearchTool: CreateWebSearchTool = {
      type: 'web_search',
      search_context_size: 'medium',
    };
    tools.push(webSearchTool);
  }

  return tools;
};
