# frozen_string_literal: true

module AdminJobs
  class AssignReportsAndAssessments < AdminJobs::Base
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    def call
      import_data = CSV.parse(URI(record.file.url).open)
      import_data = ::CampaignUsers::AssignReportsAndAssessments::ParseImportData.call!(import_data, campaign)
      ::CampaignUsers::AssignReportsAndAssessments::ProcessImport.call!(
        campaign, record.owner, import_data[1..], record
      )

      content = content_tag(:div, I18n.t('user.modals.import.imported_reports'))
      broadcast :ok, { content: content }
    end

    def generate_title_link
      return {} unless campaign

      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/participants",
        label: campaign.name
      }
    end

    def valid?
      campaign.present?
    end
  end
end
