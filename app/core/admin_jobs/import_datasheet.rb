# frozen_string_literal: true

module AdminJobs
  class ImportDatasheet < AdminJobs::Base
    include Rails.application.routes.url_helpers

    def call
      file = Roo::Excelx.new(record.file.url)
      form = ::Datasheets::DatasheetForm.new(file: file, operation: record.data['operation'])

      ::Datasheets::ParseFile.call(form, parent_resource)
    end

    def generate_title_link
      {
        href: parent_resource_url,
        label: parent_resource.name
      }
    end

    def valid?
      parent_resource.present?
    end

    private

    def parent_resource_url
      return administration_project_datasheet_rows_path(parent_resource.id) if parent_resource.is_a?(Client)

      return threesixty_datasheet_path if parent_resource.threesixty?

      "/administration/projects/#{parent_resource.project_id}/new_campaigns/#{parent_resource.id}/datasheet"
    end

    def parent_resource
      record.data['parent_resource_class'].safe_constantize.find_by(id: record.data['parent_resource_id'])
    end

    def threesixty_datasheet_path
      project = parent_resource.project
      client = project.client
      threesixty_campaign = parent_resource.threesixty_campaign

      # rubocop:disable Layout/LineLength
      "/administration/clients/#{client.id}/projects/#{project.id}/threesixty_campaigns/#{threesixty_campaign.id}/datasheets"
      # rubocop:enable Layout/LineLength
    end
  end
end
