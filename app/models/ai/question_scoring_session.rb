# frozen_string_literal: true

class AI::QuestionScoringSession < AI::AssistedUserSession
  validates :assistable_type, inclusion: { in: ['Question'] }
  validates :resource_type, inclusion: { in: ['UserAssessment'] }

  belongs_to :question, foreign_key: :assistable_id
  belongs_to :user_assessment, foreign_key: :resource_id, optional: true

  alias_attribute :scores, :checkpoint

  def parsed_dependencies
    meta.presence
  end

  def parsed_dependencies=(value)
    self.meta = value
  end

  def reset_for_rescore!
    update!(
      scores: nil,
      status: :in_progress,
      error: nil,
      parsed_dependencies: nil
    )
  end
end
