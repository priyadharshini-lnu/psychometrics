# frozen_string_literal: true

module Idp
  class PrecomputeSkillGapReportAnalysisJob < ApplicationJob
    queue_as :low_priority

    def perform(user_report_id)
      user_report = UserReport.find_by(id: user_report_id)
      return unless user_report&.prepared?

      user_idp_plan = user_report.active_user_idp_plan_for_skill_gap_analysis
      return unless user_idp_plan

      unless skill_gap_analysis_enabled?(user_idp_plan)
        Rails.logger.info("Skipping skill gap report analysis for user_report_id=#{user_report_id},
          user_idp_plan_id=#{user_idp_plan.id} - AI feature is disabled")
        return
      end

      execute_skill_gap_analysis(user_idp_plan)
    end

    private

    def skill_gap_analysis_enabled?(user_idp_plan)
      Settings.features.ai_assistant_enabled &&
        user_idp_plan.campaign.project.project_feature.ai_assisted_idp? &&
        user_idp_plan.idp_template.one_click_idp_enabled
    end

    def execute_skill_gap_analysis(user_idp_plan)
      ai_assistant = user_idp_plan.idp_template.skill_gap_report_analysis_ai_assistant
      return unless ai_assistant

      AI::Tools::Idp::SkillGapReportAnalysis.new(
        user_idp_plan,
        user_idp_plan.user,
        ai_assistant
      ).execute
    end
  end
end
