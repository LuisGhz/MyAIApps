import { MetadataModel } from '../metadata.model';
import { PriceModel } from '../price.model';
import { CreateModelDeveloperReqModel } from './create-model-developer-req.model';

export interface CreateModelReqModel {
  name: string;
  shortName: string;
  value: string;
  guestAccess: boolean;
  link: string;
  price: PriceModel;
  metadata: MetadataModel;
  developerId?: string;
  developer?: CreateModelDeveloperReqModel;
}
