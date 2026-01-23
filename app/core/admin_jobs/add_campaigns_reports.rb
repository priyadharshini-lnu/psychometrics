# frozen_string_literal: true

module AdminJobs
  class AddCampaignsReports < AdminJobs::Base
    def call
      form = ::Campaigns::Reports::Form.from_params(resource_params)

      return broadcast :ok, { error_messages: form.errors.full_messages } unless form.valid?

      error_messages = []

      ::Campaigns::Reports::Add.call(form, campaign, owner, job_record) do
        on(:ok) do |responses|
          error_messages = responses.dig(:ok, :responses, :error_messages) || []
        end
        on(:error) do |error_response|
          error_messages = Array(error_response[:base])
        end
      end

      broadcast :ok, { error_messages: error_messages }
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/assessments_reports/manage",
        label: campaign.name.to_s
      }
    end

    def generate_details
      [
        [I18n.t('administration.reports.name'), reports_names.join(', ')]
      ]
    end

    def valid?
      campaign.present? && resource_params.present?
    end

    private

    def reports_names
      Report.where(id: resource_params['report_ids']).pluck(:name)
    end

    def resource_params
      record.data['resource_params']
    end
  end
end
