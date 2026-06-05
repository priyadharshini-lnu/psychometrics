# frozen_string_literal: true

module AI
  class FactorScore < ApplicationRecord
    self.table_name = 'ai_factor_scores'
    has_paper_trail on: [:update], only: %i[override_score not_applicable], meta: {
      meta: :change_log_data
    }

    belongs_to :users_result
    belongs_to :question, optional: true
    belongs_to :factor
    belongs_to :parent_factor, class_name: 'Factor', optional: true
    include Tenantable

    tenant_source :users_result

    validates :users_result, presence: true
    validates :factor, presence: true

    attr_accessor :change_log_data

    def indicators
      AI::FactorScore.where(parent_factor_id: factor_id, users_result_id: users_result_id)
    end

    enum :status, {
      pending: 0,
      assessor_approved: 1,
      approver_approved: 2,
      auto_approved: 3
    }

    enum :scoring_type, {
      ai: 0,
      aggregated: 1
    }, prefix: true

    def final_score
      return nil if not_applicable?

      override_score || score
    end
  end
end
