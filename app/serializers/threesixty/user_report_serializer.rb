# frozen_string_literal: true

module Threesixty
  class UserReportSerializer < Panko::Serializer
    attributes :id, :status, :campaign_id, :pdf, :is_self, :results, :approval_status,
               :evalaution_completed_for_subject, :report_data, :permissions, :campaign, :module_overrides, :options,
               :user, :qc_approval_status, :report

    def user
      ::Reports::UserSerializer.new(context: { campaign: object.campaign }).serialize(object.user)
    end

    def campaign_id
      object.campaign.threesixty_campaign&.id || object.campaign_id
    end

    def is_self
      object.user_id == current_user.id
    end

    def qc_approval_status
      object.approval_status
    end

    def approval_status
      object.threesixty_subject&.report_approval_status
    end

    def campaign
      return unless context[:threesixty_campaign]

      Threesixty::CampaignDetailsSerializer.new(
        context: {
          user_report: object
        }
      ).serialize(context[:threesixty_campaign])
    end

    def results
      context[:results]
    end

    def report_data
      UserReports::PrepareUserReportData.call!(object)
    end

    def current_option
      context[:current_option]
    end

    def options
      CampaignOptionsSerializer.new.serialize(current_option)
    end

    def evalaution_completed_for_subject
      object.threesixty_subject&.evaluation_status_completed?
    end

    def module_overrides
      Panko::ArraySerializer.new(
        TextModuleOverride.where(user_report_id: object.id),
        each_serializer: TextModuleOverrideSerializer
      ).to_a
    end

    def permissions
      GetPermissionsHash.call!(
        Administration::UserReportPolicy,
        current_user,
        object,
        ['download'],
        {
          project_id: object.campaign.project_id,
          campaign_id: object.campaign_id
        }
      )
    end

    private

    def report
      ReportSerializer.new(
        context: {
          results: results,
          piped_text_context: context[:piped_text_context]
        }
      ).serialize(context[:report])
    end

    def current_user
      context[:current_user]
    end
  end
end
