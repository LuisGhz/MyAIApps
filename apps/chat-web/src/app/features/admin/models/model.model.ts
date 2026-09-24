import { DeveloperModel } from './developer.model';
import { MetadataModel } from './metadata.model';
import { PriceModel } from './price.model';

export interface ModelModel {
  id: string;
  name: string;
  shortName: string;
  value: string;
  link: string;
  price: PriceModel;
  metadata: MetadataModel;
  developer: DeveloperModel;
  createdAt: Date;
  updatedAt: Date;
}
