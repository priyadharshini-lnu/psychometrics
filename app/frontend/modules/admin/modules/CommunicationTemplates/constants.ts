export type TemplateLevel = 'platform' | 'client' | 'project' | 'campaign'

export interface TemplateScope {
  clientId?: string
  projectId?: string
  campaignId?: string
}

export const KINDS = [
  'invitation',
  'reminder',
  'completion',
  'other',
  'workshop_invite',
  'workshop_invite_reminder',
  'workshop_booked',
  'workshop_upcoming_reminder',
  'workshop_cancelled',
  'workshop_completed',
  'magic_link_email',
  'report_available',
  'idp_template_assigned',
  'idp_template_approved',
  'idp_template_rejected',
  'development_action_deadline_missed',
  'idp_deadline_missed',
  'assessment_center_booking_summary',
]

export const STATUSES = ['draft', 'active', 'archived']

// CommunicationDelivery enum :trigger_type
export const TRIGGER_TYPES = ['manual', 'scheduled']

// CommunicationDelivery enum :delivery_rule
export const DELIVERY_RULES = ['send_now', 'specific_datetime', 'not_started', 'not_completed', 'in_progress']
export const REMINDER_DELIVERY_RULES = ['not_started', 'not_completed', 'in_progress']

// CommunicationDelivery enum :recipients (and CommunicationTemplate enum :recipients_default)
export const RECIPIENTS = ['all', 'selected', 'new_users', 'new_assignment']

// CommunicationDelivery#delivery_frequency (free string, validated in Api::V2::CommunicationDelivery::Contract)
export const DELIVERY_FREQUENCIES = ['daily', 'weekly', 'specific_weekdays']

// CommunicationDelivery#delivery_interval_period (free string) -- must stay in sync with
// Communications::Deliveries::Dispatch::VALID_INTERVAL_PERIODS and the identically-named constant in
// app/jobs/communications/deliveries/dispatch_job.rb, both app/core & app/jobs side.
export const INTERVAL_PERIODS = ['hours', 'days', 'weeks', 'months']

// CommunicationDelivery#delivery_weekdays (free string array)
export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

// CommunicationDelivery#status
export const TERMINAL_STATUSES = ['cancelled', 'completed', 'failed']
