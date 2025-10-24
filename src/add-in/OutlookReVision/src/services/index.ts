// index.ts - Service exports for easy importing

export {
  IOutlookService,
  EmailContent,
  OutlookServiceResult,
  OutlookServiceError,
} from "./OutlookService";
export { RealOutlookService } from "./RealOutlookService";
export { MockOutlookService, MockTestScenarios } from "./MockOutlookService";
export {
  ServiceProvider,
  useServices,
  useOutlookService,
  useReVisionService,
  useIsMockMode,
} from "./ServiceProvider";

// ReVision service exports
export {
  IReVisionService,
  TranslateRequest,
  TranslateResponse,
  ReVisionServiceResult,
  ReVisionServiceError,
} from "./ReVisionService";
export { RealReVisionService } from "./RealReVisionService";
