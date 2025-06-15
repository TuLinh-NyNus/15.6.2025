import { SetMetadata } from '@nestjs/common';

export const OWNERSHIP_KEY = 'requireOwnership';
export const RequireOwnership = () => SetMetadata(OWNERSHIP_KEY, true); 
