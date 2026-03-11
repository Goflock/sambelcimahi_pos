import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): object {
        return {
            message: 'Cimahi POS API',
            version: '1.0.0',
            status: 'running',
            timestamp: new Date().toISOString(),
        };
    }
}
