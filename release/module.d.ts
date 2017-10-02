import { ModuleWithProviders } from '@angular/core';
import { KioNg2ImageModuleConfig } from './config/interfaces';
export { IMAGE_MODULE_CONFIG } from './config/IMAGE_MODULE_CONFIG.token';
export declare class KioNg2ImageModule {
    static forRoot(config: KioNg2ImageModuleConfig): ModuleWithProviders;
}
