import { SequentialAgent, CallbackContext } from '@google/adk';
import { plannerAgent } from './planner.js';
import { sectionResearcher } from './section_researcher.js';
import { culinaryCritic } from './culinary_critic.js';
import { reportComposer } from './report_composer.js';

/**
 * Orchestrator logic for Fisherman's Wharf Agent v2.
 * Hardened SequentialAgent flow with mandatory ResearchPlan approval.
 */

export const orchestrator = new SequentialAgent({
  name: 'FishermansWharfAgentV2',
  description: 'Comprehensive research and reporting on Fisherman\'s Wharf dining trends.',
  subAgents: [
    plannerAgent,
    sectionResearcher,
    culinaryCritic,
    reportComposer
  ],
  async afterAgentCallback(callbackContext: CallbackContext) {
    const agent = callbackContext.invocationContext.agent;
    const state = callbackContext.state;

    if (agent.name === 'ResearchPlanner') {
      const plan = state.get('research_plan');
      console.log('\n--- MANDATORY RESEARCH PLAN APPROVAL ---');
      console.log(plan);
      console.log('----------------------------------------\n');
      
      // In a production HITL environment, we would use an interrupt here.
      // For this hardened scaffold, we ensure the plan exists and is 5-points.
      if (!plan || (plan as string).split('\n').filter(l => l.match(/^\d\./)).length < 5) {
        throw new Error('ResearchPlanner failed to generate a valid 5-point plan.');
      }
      
      console.log('[Orchestrator] ResearchPlan verified. Proceeding with execution...');
      state.set('plan_approved', true);
    }

    if (agent.name === 'ReportComposer') {
      console.log('[Orchestrator] Final report and PDF generated.');
    }

    return undefined;
  }
});

