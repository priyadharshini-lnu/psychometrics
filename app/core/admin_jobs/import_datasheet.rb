# frozen_string_literal: true

module AdminJobs
  class ImportDatasheet < AdminJobs::Base
    include Rails.application.routes.url_helpers

    def call
      file = Roo::Excelx.new(record.file.url)
      current_sheet = parent_resource.sheets.find_by(type: 'Datasheet')
      form = ::Sheets::SheetForm.new(file: file).with_context(sheet_type: 'Datasheet', sheet: current_sheet)

      ::Sheets::ParseFile.call(form, parent_resource, 'Datasheet')

      broadcast :ok
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
      return administration_project_sheet_rows_path(parent_resource.id) if parent_resource.is_a?(Client)

      "/admin/projects/#{parent_resource.project_id}/new_campaigns/#{parent_resource.id}/datasheet"
    end

    def parent_resource
      record.data['parent_resource_class'].safe_constantize.find_by(id: record.data['parent_resource_id'])
    end
  end
end
