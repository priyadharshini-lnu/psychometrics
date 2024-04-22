# frozen_string_literal: true

module Users
  class CreateAnonymCampaignUser < BaseCommand
    attr_reader :campaign, :assessment, :user

    def initialize(campaign_assessment, user = nil)
      @campaign = campaign_assessment.campaign
      @assessment = campaign_assessment.assessment
      @user = user
    end

    def call
      if user.nil?
        # Generate uniq anonym user email
        uniq_anonym_email = loop do
          email = "Anonym#{Time.now.to_i}#{rand(10_000)}@example.com"
          break email unless User.exists?(email: email)
        end
        # Build anonym user with membership
        @user = User.new(
          role: User::REGULAR_ROLE, is_anonym: true,
          first_name: 'Anonymous', last_name: 'User',
          email: uniq_anonym_email,
          project: campaign.project
        )

        strong_password = user.generate_strong_password

        user.password = strong_password
        user.password_confirmation = strong_password
        user.save!

        user.campaign_users.create(campaign: campaign)
      else
        user.campaign_users.create(campaign: campaign) unless user.campaign_users.exists?(campaign: campaign)
      end

      add_assessment_to_user(user)

      broadcast :ok, user
    end

    private

    def add_assessment_to_user(user)
      users_result = UsersResult.create(answers: {})
      UserAssessment.create(
        started_at: Time.zone.now,
        expiry_date: assessment.extra['timer']&.second&.from_now,
        assessment: assessment,
        campaign: campaign,
        subject: user,
        evaluator: user,
        status: :in_progress,
        users_result: users_result,
        last_activity_at: DateTime.current
      )
    end
  end
end
