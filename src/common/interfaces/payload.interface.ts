import { ERole } from '../enums/users/roles.enum';

export interface IPayloadToken {
  id: number;
  username: string;
  email: string;
  roles: ERole[];
  clientId?: number;
}
