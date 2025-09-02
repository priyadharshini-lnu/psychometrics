# frozen_string_literal: true

# STI model for AI-assisted IDP (Individual Development Plan) sessions.
class AI::AssistedUserIdpSession < AI::AssistedUserSession
  alias_attribute :suggested_plan, :checkpoint

  validates :assistable_type, inclusion: { in: ['UserIdpPlan'] }
end
