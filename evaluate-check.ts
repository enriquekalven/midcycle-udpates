import { v1beta1 } from '@google-cloud/aiplatform';
const client = new v1beta1.EvaluationServiceClient();
console.log(Object.getOwnPropertyNames(v1beta1.EvaluationServiceClient.prototype));
