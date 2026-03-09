import { v1beta1 } from '@google-cloud/aiplatform';
type Reqs = Parameters<typeof v1beta1.EvaluationServiceClient.prototype.evaluateInstances>[0];
let req: Reqs;
console.log("TypeScript test");
