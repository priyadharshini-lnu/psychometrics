# frozen_string_literal: true

module Users
  class CreateAnonymCampaignUser < BaseCommand
    attr_reader :campaign, :assessment, :user, :campaign_assessment

    def initialize(campaign_assessment, user = nil)
      @campaign_assessment = campaign_assessment
      @campaign = campaign_assessment.campaign
      @assessment = campaign_assessment.assessment
      @user = user
    end

    def call
      ActiveRecord::Base.transaction do
        @user = create_anonym_user if user.nil?
        user.campaign_users.create(campaign: campaign) unless user.campaign_users.exists?(campaign: campaign)

        ensure_sufficient_licenses
        add_assessment_to_user(user)
      end

      broadcast :ok, user
    end

    private

    def create_anonym_user
      uniq_anonym_email = generate_unique_anonym_email
      user = User.new(
        role: User::REGULAR_ROLE, is_anonym: true,
        first_name: 'Anonymous', last_name: 'User',
        email: uniq_anonym_email,
        project: campaign.project
      )

      strong_password = user.generate_strong_password
      user.password = strong_password
      user.password_confirmation = strong_password
      user.save!
      user
    end

    def generate_unique_anonym_email
      loop do
        email = "Anonym#{Time.now.to_i}#{rand(10_000)}@example.com"
        break email unless User.exists?(email: email)
      end
    end

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
        last_activity_at: DateTime.current,
        prework: campaign_assessment&.prework.present?
      )
    end

    def ensure_sufficient_licenses
      campaign_reports.each do |campaign_report|
        Licenses::Use.call!(campaign, user, campaign_report.report, campaign_report.report_family_id)
      end
    end

    def campaign_reports
      campaign.
        campaign_reports.
        includes(:report).
        where(report: assessment.report_ids)
    end
  end
end
