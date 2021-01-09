# frozen_string_literal: true

module Assessors
  class CreateOneForm < Rectify::Form
    attribute :assessor_first_name, String
    attribute :assessor_last_name, String
    attribute :assessor_email, String
    attribute :assessor_password, String
    attribute :assessment_ids, Array[Integer]
    attribute :subject_email, String

    validates :assessor_email, :subject_email, format: { with: Devise.email_regexp }
    validates :assessor_email, :subject_email, :assessor_first_name, :assessor_last_name, presence: true
    validates :assessor_password, length: { within: Devise.password_length }, allow_blank: true
    validates :assessor_password, allow_blank: true, strong_password: true

    validate :check_subject
    validate :check_existing_assessor_subject_relation
    validate :check_assessment_ids

    def check_subject
      errors.add(:subject_email, :not_exists, email: subject_email) unless subject
    end

    def check_existing_assessor_subject_relation
      if UserAssessment.joins(:relationship).where(
        relationships: { name: Relationship::ASSESSOR },
        subject: subject,
        evaluator: assessor_user,
        campaign: context.campaign
      ).exists?
        errors.add(:assessor_email, :already_exists)
      end
    end

    def check_assessment_ids
      available_assessment_ids = Assessors::AvailableAssessmentsQuery.new(context.campaign.client).query.pluck(:id)
      assessment_ids.each do |id|
        errors.add(:assessment_ids, :invalid, id: id) if available_assessment_ids.exclude?(id)
      end
    end

    private

    def subject
      @subject ||= context.campaign.users.find_by(email: subject_email)
    end

    def assessor_user
      @assessor_user ||= context.campaign.assessors.includes(:user).
                         where(users: { email: assessor_email }).first&.user
    end
  end
end
