# frozen_string_literal: true

# STI model for AI-assisted development actions generation sessions.
# Uses UserIdpSkill as assistable to reference files with context.
#
class AI::AssistedUserDevelopmentActionsSession < AI::AssistedUserSession
  alias_attribute :development_actions, :checkpoint

  validates :assistable_type, inclusion: { in: ['UserIdpSkill'] }
end
