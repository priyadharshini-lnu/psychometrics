# frozen_string_literal: true

module Idp
  class GetSkillGapReportData < BaseCommand
    attr_accessor :user, :active_user_idp_plan, :options

    def initialize(user, options = {})
      @user = user
      @options = options
    end

    def call
      validate_active_idp_plan_exists!
      validate_skill_gap_report_exists!
      validate_user_skill_gap_report_prepared!

      broadcast :ok, ::UserSkillGapReportSerializer.new({
        context: {
          campaign: campaign,
          user_idp_plan: user_idp_plan,
          skill_gap_report: skill_gap_report,
          current_user: options[:current_user],
          piped_text_context: piped_text_context,
          lang: options[:lang]
        }
      }).serialize(user_skill_gap_report)
    rescue ActiveRecord::RecordNotFound => e
      broadcast :error, [{ base: e.message }]
    end

    private

    def validate_active_idp_plan_exists!
      if user_idp_plan.blank?
        raise ActiveRecord::RecordNotFound.new(
          I18n.t('errors.user_idp_plan.no_active_plan'), UserIdpPlan, user.id
        )
      end
    end

    def validate_skill_gap_report_exists!
      if skill_gap_report.blank?
        raise ActiveRecord::RecordNotFound.new(I18n.t('errors.skill_gap_report.not_found'), Report,
                                               user_idp_plan.id)
      end
    end

    def validate_user_skill_gap_report_prepared!
      unless user_skill_gap_report.prepared?
        raise ActiveRecord::RecordNotFound.new(I18n.t('errors.skill_gap_report.not_found'), UserReport,
                                               user_skill_gap_report.id)
      end
    end

    def user_idp_plan
      @user_idp_plan ||= user.active_user_idp_plan
    end

    def campaign
      @campaign ||= user_idp_plan.campaign
    end

    def skill_gap_report
      @skill_gap_report ||= user_idp_plan.skill_gap_report
    end

    def user_skill_gap_report
      @user_skill_gap_report ||= UserReport.find_by!(user: user, report: skill_gap_report, campaign: campaign)
    end

    def piped_text_context
      {
        subject: user_skill_gap_report.user
      }
    end
  end
end
