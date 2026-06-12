# frozen_string_literal: true

class ReflectionQuestion < ApplicationRecord
  include Mobility

  translates :question

  belongs_to :project
  has_many :idp_template_reflection_questions, dependent: :destroy
  has_one :user_reflection_question_answer, dependent: :destroy

  tenant_config has_global_records: true, optional: true
  include Tenantable

  def self.ransackable_attributes(_auth_object = nil)
    %w[project_id question]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[project]
  end
end
