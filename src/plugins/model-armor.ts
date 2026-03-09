import { SecurityPlugin, BasePolicyEngine, PolicyCheckResult, ToolCallPolicyContext, PolicyOutcome } from '@google/adk';

/**
 * Custom Policy Engine implementing Native Model Armor and DLP rules.
 */
class ModelArmorPolicyEngine implements BasePolicyEngine {
  async evaluate(context: ToolCallPolicyContext): Promise<PolicyCheckResult> {
    const { tool, toolArgs } = context;
    const query = (toolArgs.query as string || "").toLowerCase();

    // Extract all string arguments from the tool call to check for sensitive keywords
    const allArgs = Object.values(toolArgs).join(" ").toLowerCase();
    
    // 1. DLP Rule: Intercept sensitive data (salary, wifi, credentials)
    // Refined: Completely TRUST our internal bistro tools for commerce and lookup
    const toolName = tool.name || (tool as any).name || "";
    const isTrustedBistroTool = toolName === "retrieve_restaurant_data" || toolName === "secure_checkout_ucp" || toolName.includes("menu");

    const isFinancialTrigger = allArgs.includes("salary") || allArgs.includes("compensation") || (allArgs.includes("pay") && !isTrustedBistroTool);
    const isSecurityTrigger = allArgs.includes("wifi") || allArgs.includes("password") || allArgs.includes("credential");

    // Skip all restrictive DLP checks if it's a menu context or a trusted tool
    const culinaryKeywords = ["chowder", "crab", "cioppino", "fish", "chips", "pudding", "brownie", "menu", "order", "item", "price", "cost", "buy", "table", "bistro", "sopa", "estofado", "cangrejo"];
    const isCulinaryContext = culinaryKeywords.some(k => allArgs.includes(k));

    if (!isTrustedBistroTool && (isSecurityTrigger || (isFinancialTrigger && !isCulinaryContext))) {
      return {
        outcome: PolicyOutcome.DENY,
        reason: "MODEL_ARMOR_DLP_VIOLATION: Access Denied. I'm not authorized to disclose confidential staff or internal Wi-Fi credentials."
      };
    }

    // 2. Scope Guardrail: Block non-restaurant/non-wharf queries
    const allowedKeywords = [
      "restaurant", "food", "menu", "wharf", "crab", "chowder", "bistro", "pier", "fish",
      "entree", "entrees", "dish", "appetizer", "dessert", "drink", "wine", "beer", "beverage",
      "order", "serve", "price", "cost", "location", "address", "phone", "reservation", "book", "table", "hours",
      "recommend", "recommendation", "dinner", "lunch", "breakfast", "eat", "hungry", "tasty", "delicious",
      "chef", "staff", "manager", "team", "rossi", "marco",
      "comida", "cena", "plato", "menú", "restaurante", "pescado", "mariscos", "reserva", "precio", "especialidad", "recomienda", "desayuno", "delicioso", "hora", "cierran", "abren", "cuándo", "tiempo"
    ];




    const isOutOfScope = !allowedKeywords.some(keyword => query.includes(keyword));

    if (isOutOfScope && query.length > 0) {
      return {
        outcome: PolicyOutcome.DENY,
        reason: "MODEL_ARMOR_SCOPE_VIOLATION: Query is outside the allowed domain of Fisherman's Wharf dining. [Rule: STRICT_DOMAIN_ENFORCEMENT]"
      };
    }

    return {
      outcome: PolicyOutcome.ALLOW
    };
  }
}

export const modelArmorPlugin = new SecurityPlugin({
  policyEngine: new ModelArmorPolicyEngine()
});
