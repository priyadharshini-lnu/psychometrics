# frozen_string_literal: true

module AdminJobs
  class CreateThreesixtyCampaign < AdminJobs::Base
    include Rails.application.routes.url_helpers

    def call
      form = ::Threesixty::Campaigns::CreateForm.from_params(record.data['data'])
      campaing = ::Threesixty::Campaigns::Create.call!(project, form, record.owner)
      record.update(data: record.data.merge(campaign_id: campaing.id))

      broadcast :ok
    end

    def valid?
      project.present?
    end

    private

    def project
      @project ||= Project.find_by(id: record.data['project_id'])
    end

    def campaign
      @campaign ||= ::Threesixty::Campaign.find_by(id: record.data['campaign_id'])&.campaign
    end
  end
end
