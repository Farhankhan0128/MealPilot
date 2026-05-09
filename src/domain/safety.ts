import type { CommerceAction, Recommendation, ToolCallEvent } from "./types.js";

const nonIdempotentActions: CommerceAction[] = ["place_food_order", "checkout", "book_table"];

export function requiresExplicitConfirmation(action: CommerceAction): boolean {
  return nonIdempotentActions.includes(action);
}

export function buildConfirmationMessage(recommendation: Recommendation): string {
  const itemList = recommendation.items.map((item) => `${item.name} (${item.quantity})`).join(", ");
  const total = recommendation.total.toLocaleString("en-IN");

  if (recommendation.confirmationAction === "book_table") {
    return `Book ${recommendation.provider} at ${recommendation.locationLabel} for ${recommendation.eta}? Estimated spend Rs ${total}.`;
  }

  return `Confirm ${recommendation.title} from ${recommendation.provider}: ${itemList}. Estimated total Rs ${total}.`;
}

export function canCompleteAction(recommendation: Recommendation): boolean {
  return recommendation.status === "prepared" && requiresExplicitConfirmation(recommendation.confirmationAction);
}

export function redactAuditEvent(event: ToolCallEvent): ToolCallEvent {
  return {
    ...event,
    detail: event.detail
      .replace(/\b\d{10}\b/g, "[redacted_phone]")
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted_email]"),
  };
}
