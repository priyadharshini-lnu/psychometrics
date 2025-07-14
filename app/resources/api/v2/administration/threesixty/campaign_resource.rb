# frozen_string_literal: true

class Api::V2::Administration::Threesixty::CampaignResource < Api::V2::Administration::BaseResource
  attributes :assessment_id, :report_id, :name, :dimension_id

  has_one :assessment
  has_one :report
  delegate :dimension_id, to: :assessment

  def meta_details
    {
      permissions: permissions
    }
  end

  def permissions
    lambda {
      GetPermissionsHash.call!(
        Administration::Threesixty::CampaignPolicy,
        context[:user],
        @model,
        %w[
          edit_participant_options
          edit_report_options
          access_email_messages
          access_instruction_messages
          access_messages_options
          edit_assessment
          edit_report
          edit_dimension
          manage_relationships
          manage_factor_benchmark_scores
          view_factor_benchmark_scores
          regenerate_report
          manage_admins
        ],
        project_id: context[:project_id],
        campaign_id: context[:campaign_id]
      ).transform_keys! { |k| k.camelcase(:lower) }
    }
  end
end
