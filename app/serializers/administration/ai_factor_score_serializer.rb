# frozen_string_literal: true

module Administration
  class AIFactorScoreSerializer < Panko::Serializer
    attributes :id, :name, :description, :score, :override_score, :factor_id, :question_id, :confidence, :citations,
               :rationale, :status, :parent_factor_id, :change_log, :not_applicable, :scoring_type

    def name
      object.factor.name
    end

    def description
      object.factor.description
    end

    def change_log
      object.versions.select(:id, :created_at, :object_changes, :meta)
    end

    private

    def current_user
      context[:current_user]
    end
  end
end
