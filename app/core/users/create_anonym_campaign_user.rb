# frozen_string_literal: true

module Users
  class CreateAnonymCampaignUser < BaseCommand
    attr_reader :campaign, :assessment

    def initialize(campaign_assessment)
      @campaign = campaign_assessment.campaign
      @assessment = campaign_assessment.assessment
    end

    def call
      # Generate uniq anonym user email
      uniq_anonym_email = loop do
        email = "Anonym#{Time.now.to_i}#{rand(10_000)}@example.com"
        break email unless User.exists?(email: email)
      end

      # Build anonym user with membership
      user = User.create(
        role: User::REGULAR_ROLE, is_anonym: true,
        first_name: 'Anonymous', last_name: 'User',
        email: uniq_anonym_email,
        password: uniq_anonym_email, password_confirmation: uniq_anonym_email,
        project: campaign.project
      )
      user.campaign_users.create(campaign: campaign)

      add_assessment_to_user(user)

      broadcast :ok, user
    end

    private

    def add_assessment_to_user(user)
      users_result = UsersResult.create(
        status: :in_progress,
        last_activity_at: DateTime.current,
        expiry_date: assessment.extra['timer']&.second&.from_now,
        answers: {}
      )
      UserAssessment.create(
        assessment: assessment,
        campaign: campaign,
        subject: user,
        evaluator: user,
        users_result: users_result
      )
    end
  end
end
