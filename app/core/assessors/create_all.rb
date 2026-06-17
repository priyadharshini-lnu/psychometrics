# frozen_string_literal: true

module Assessors
  class CreateAll < BaseCommand
    private_attr_reader :assessors, :campaign, :current_user

    def initialize(assessors, campaign, current_user)
      @assessors = assessors
      @campaign = campaign
      @current_user = current_user
      @existing_assessors_whose_password_not_changed = []
      @new_assessors = []
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
      broadcast :ok, @new_assessors, @existing_assessors_whose_password_not_changed
    end

    private

    def get_assessor(assessor_attrs)
      Assessor.joins(:user).find_by(users: { email: assessor_attrs[:assessor_email] }, campaign: campaign)
    end

    def create_assessor(user)
      ensure_client_assessor_membership(user)
      assessor = Assessor.create!(campaign: campaign, user: user)
      @new_assessors << assessor
      assessor
    end

    def ensure_client_assessor_membership(user)
      Membership.find_or_create_by!(
        user: user,
        client: campaign.client,
        role: Membership::CLIENT_ASSESSOR_ROLE,
        campaign_id: nil
      )
    end

    def create_user_assessment(assessor_user, subject, assessment_id)
      user_result = UsersResult.create!
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
      if user
        @existing_assessors_whose_password_not_changed << user if assessor_attrs[:assessor_password].present?
      else
        user = ::Users::Admin.create!(
          email: assessor_attrs[:assessor_email],
          password: assessor_attrs[:assessor_password],
          first_name: assessor_attrs[:assessor_first_name],
          last_name: assessor_attrs[:assessor_last_name],
          create_by_invite: assessor_attrs[:assessor_password].blank?,
          project: nil
        )
        user.invite_assessor!
      end
      user
    end

    def find_subject(assessor_attrs)
      User.find_by(email: assessor_attrs[:subject_email], project_id: campaign.project_id)
    end
  end
end
