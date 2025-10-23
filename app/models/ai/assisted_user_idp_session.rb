# frozen_string_literal: true

# STI model for AI-assisted IDP (Individual Development Plan) sessions.
class AI::AssistedUserIdpSession < AI::AssistedUserSession
  alias_attribute :suggested_plan, :checkpoint

  validates :assistable_type, inclusion: { in: ['UserIdpPlan'] }

  def add_skill_to_checkpoint!(skill_id:, development_actions:, reason:)
    skill_data = {
      skill_id: skill_id,
      development_actions: development_actions,
      reason: reason
    }

    if checkpoint.present?
      current_skills = checkpoint.is_a?(Array) ? checkpoint : []
      self.checkpoint = current_skills << skill_data
    else
      self.checkpoint = [skill_data]
    end

    save!
  end
end
