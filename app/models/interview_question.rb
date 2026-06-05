# frozen_string_literal: true

class InterviewQuestion < ApplicationRecord
  include Taggable

  acts_as_taggable_on :tags
  has_many :idp_template_interview_questions, dependent: :destroy

  include Tenantable

  enum :question_type, { audio: 0, video: 1 }

  def self.ransackable_attributes(_auth_object = nil)
    %w[question]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[project]
  end
end
