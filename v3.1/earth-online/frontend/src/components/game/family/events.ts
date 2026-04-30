/**
 * Family System Event Bus
 * 
 * Provides a type-safe event system for family-related operations.
 * Supports decoupled communication between components and enables
 * future extensibility (adoption, polygamy, etc.)
 */

// ============================================================
// Event Types
// ============================================================

export type FamilyEventType =
  | 'marriage_proposal'
  | 'marriage_accepted'
  | 'marriage_declined'
  | 'wedding_ceremony'
  | 'childbirth'
  | 'child_named'
  | 'divorce_initiated'
  | 'divorce_finalized'
  | 'spouse_interaction'
  | 'child_interaction'
  | 'family_member_death'
  | 'family_tree_updated';

export interface FamilyEvent {
  type: FamilyEventType;
  timestamp: number;
  data: Record<string, unknown>;
}

type EventCallback = (event: FamilyEvent) => void;

// ============================================================
// FamilyEventBus Class
// ============================================================

class FamilyEventBus {
  private listeners: Map<FamilyEventType, Set<EventCallback>> = new Map();

  /**
   * Subscribe to a specific family event type
   */
  on(type: FamilyEventType, callback: EventCallback): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.off(type, callback);
    };
  }

  /**
   * Unsubscribe from an event
   */
  off(type: FamilyEventType, callback: EventCallback): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(type);
      }
    }
  }

  /**
   * Emit a family event to all subscribers
   */
  emit(type: FamilyEventType, data: Record<string, unknown> = {}): void {
    const event: FamilyEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in family event listener for ${type}:`, error);
        }
      });
    }

    // Also emit to 'all' listeners if registered
    const allCallbacks = this.listeners.get('*' as FamilyEventType);
    if (allCallbacks) {
      allCallbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in family event listener (all):', error);
        }
      });
    }
  }

  /**
   * Subscribe to all family events
   */
  onAll(callback: EventCallback): () => void {
    return this.on('*' as FamilyEventType, callback);
  }

  /**
   * Clear all listeners for a specific event type
   */
  clear(type?: FamilyEventType): void {
    if (type) {
      this.listeners.delete(type);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get listener count for debugging
   */
  getListenerCount(type?: FamilyEventType): number {
    if (type) {
      return this.listeners.get(type)?.size || 0;
    }
    let total = 0;
    this.listeners.forEach(callbacks => {
      total += callbacks.size;
    });
    return total;
  }
}

// ============================================================
// Singleton Instance
// ============================================================

export const familyEventBus = new FamilyEventBus();

// ============================================================
// Convenience Functions
// ============================================================

/**
 * Emit a marriage proposal event
 */
export function emitMarriageProposal(candidateId: string, candidateName: string, compatibility: number): void {
  familyEventBus.emit('marriage_proposal', {
    candidate_id: candidateId,
    candidate_name: candidateName,
    compatibility,
  });
}

/**
 * Emit a marriage accepted event
 */
export function emitMarriageAccepted(candidateId: string, spouseName: string): void {
  familyEventBus.emit('marriage_accepted', {
    candidate_id: candidateId,
    spouse_name: spouseName,
  });
}

/**
 * Emit a childbirth event
 */
export function emitChildbirth(childName: string, gender: string, bornAt: number): void {
  familyEventBus.emit('childbirth', {
    child_name: childName,
    gender,
    born_at: bornAt,
  });
}

/**
 * Emit a divorce event
 */
export function emitDivorce(reason: string, spouseName: string): void {
  familyEventBus.emit('divorce_finalized', {
    reason,
    spouse_name: spouseName,
  });
}

/**
 * Emit a spouse interaction event
 */
export function emitSpouseInteraction(interactionType: string, intimacyChange: number): void {
  familyEventBus.emit('spouse_interaction', {
    interaction_type: interactionType,
    intimacy_change: intimacyChange,
  });
}
