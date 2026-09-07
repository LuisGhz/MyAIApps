import { MetadataModel } from '../metadata.model';
import { PriceModel } from '../price.model';

export interface UpdateModelReqModel {
  name?: string;
  shortName?: string;
  value?: string;
  guestAccess?: boolean;
  link?: string;
  price?: PriceModel;
  metadata?: MetadataModel;
  developerId?: string;
}
