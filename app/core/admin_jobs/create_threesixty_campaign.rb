# frozen_string_literal: true

module AdminJobs
  class CreateThreesixtyCampaign < AdminJobs::Base
    include Rails.application.routes.url_helpers

    def call
      form = ::Threesixty::Campaigns::CreateForm.from_params(record.data['data'])
      ::Threesixty::Campaigns::Create.call!(project, form, record.owner)

      broadcast :ok
    end

    def generate_title_link
      {
        href: "#{admin_path}/projects/#{project.id}/new_campaigns",
        label: project.name
      }
    end

    def valid?
      project.present?
    end

    private

    def project
      @project ||= Project.find_by(id: record.data['project_id'])
    end
  end
end
