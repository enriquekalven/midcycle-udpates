import { AgentCard } from '@a2a-js/sdk';
import { sectionResearcherCard } from './agents/section-researcher.js';
import { culinaryCriticCard } from './agents/culinary-critic.js';
import { reportComposerCard } from './agents/report-composer.js';

/**
 * A2A v0.3 Agent Registry (In-memory Mock for demo)
 */
export class AgentRegistry {
  private static registry = new Map<string, AgentCard>();

  static async initialize() {
    this.register(sectionResearcherCard);
    this.register(culinaryCriticCard);
    this.register(reportComposerCard);
    console.log('[AgentRegistry] Initialized with 3 specialized agents.');
  }

  static register(card: AgentCard) {
    this.registry.set(card.name, card);
  }

  /**
   * Discover agents by skill or tag (A2A v0.3 discovery pattern)
   */
  static discoverByTag(tag: string): AgentCard[] {
    return Array.from(this.registry.values()).filter(card => 
      card.skills?.some(skill => skill.tags?.includes(tag))
    );
  }

  static getAgent(name: string): AgentCard | undefined {
    return this.registry.get(name);
  }

  static listAll(): AgentCard[] {
    return Array.from(this.registry.values());
  }
}
