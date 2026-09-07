export interface AiModelDeveloper {
  name: string;
  imageUrl: string;
}

export interface AiModelModel {
  id: string;
  name: string;
  shortName: string;
  value: string;
  developer: AiModelDeveloper;
}
