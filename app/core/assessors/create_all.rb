# frozen_string_literal: true

module Assessors
  class CreateAll < BaseCommand
    private_attr_reader :assessors, :campaign, :current_user

    def initialize(assessors, campaign, current_user)
      @assessors = assessors
      @campaign = campaign
      @current_user = current_user
    end

    def call
      assessors.each do |assessor_attrs|
        assessor = get_assessor(assessor_attrs)
        assessor_user = find_or_create_assessor_user(assessor_attrs)
        subject = find_subject(assessor_attrs)

        create_assessor(assessor_user) unless assessor

        assessor_attrs[:assessment_ids].each do |assessment_id|
          create_user_assessment(assessor_user, subject, assessment_id)
        end
      end
      broadcast :ok
    end

    private

    def get_assessor(assessor_attrs)
      Assessor.joins(:user).find_by(users: { email: assessor_attrs[:assessor_email] }, campaign: campaign)
    end

    def create_assessor(user)
      Assessor.create!(campaign: campaign, user: user)
    end

    def create_user_assessment(assessor_user, subject, assessment_id)
      user_result = UsersResult.create(
        assessment_id: assessment_id,
        subject: subject,
        evaluator: assessor_user,
        answers: {}
      )
      UserAssessment.create!(
        assessment_id: assessment_id,
        evaluator: assessor_user,
        subject: subject,
        campaign: campaign,
        relationship: Relationship.assessor_relationship,
        users_result: user_result
      )
    end

    def find_or_create_assessor_user(assessor_attrs)
      user = User.find_by(email: assessor_attrs[:assessor_email], project: nil)
      unless user
        user = ::Users::Admin.create!(
          email: assessor_attrs[:assessor_email],
          first_name: assessor_attrs[:assessor_first_name],
          last_name: assessor_attrs[:assessor_last_name],
          create_by_invite: true,
          project: nil
        )
        user.invite_assessor!(current_user)
      end
      user
    end

    def find_subject(assessor_attrs)
      User.find_by(email: assessor_attrs[:subject_email])
    end
  end
end
