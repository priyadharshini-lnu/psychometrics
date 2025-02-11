# frozen_string_literal: true

module Idp
  class AssignUserIdp < BaseCommand
    attr_accessor :user, :idp_template_id, :campaign_id, :creator

    def initialize(user, idp_template_id, campaign_id, creator = nil)
      @user = user
      @idp_template_id = idp_template_id
      @campaign_id = campaign_id
      @creator = creator
    end

    def call
      ActiveRecord::Base.transaction do
        existing_idp = user.user_idp_plans.find_by(campaign_id: campaign_id, idp_template_id: idp_template_id)
        @assigned_user_plan = assign_idp_plan(existing_idp)

        assign_skill_gap_report_to_user

        broadcast :ok, @assigned_user_plan
      end
    end

    private

    def assign_idp_plan(current_plan)
      user.user_idp_plans.where(campaign_id: campaign_id).update_all(active: false)

      if current_plan
        current_plan.update!(active: true)
        current_plan
      else
        transaction do
          campaign = Campaign.find(campaign_id)
          idp_plan = user.user_idp_plans.create(idp_template_id: idp_template_id, campaign_id: campaign_id,
                                                active: true, creator_id: creator&.id)
          Licenses::IdpUse.call!(campaign, user, idp_plan)
          idp_plan
        end
      end
    end

    def assign_skill_gap_report_to_user
      return if skill_gap_report.blank?

      Campaigns::Users::AddReport.call(
        campaign_user,
        skill_gap_report,
        current_user: creator,
        report_family_id: report_family.id,
        user_access: true,
        assessments: skill_gap_report.assessments,
        idp_license_usage: true
      )
    end

    def skill_gap_report
      @skill_gap_report ||= @assigned_user_plan.skill_gap_report
    end

    def campaign_user
      @campaign_user ||= @assigned_user_plan.campaign_user
    end

    def client
      @client ||= @assigned_user_plan.client
    end

    def report_family
      ReportFamily.
        joins(:licenses, :report_families_reports).
        where(licenses: { id: client.usable_license_id }).
        where(report_families_reports: { report_id: skill_gap_report.id }).
        first
    end
  end
end
