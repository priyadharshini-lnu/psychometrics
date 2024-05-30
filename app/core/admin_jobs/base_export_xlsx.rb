# frozen_string_literal: true

module AdminJobs
  class BaseExportXlsx < AdminJobs::Base
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    def call
      directory = Rails.root.join('tmp', export_name, record.id.to_s)
      FileUtils.mkdir_p(directory)
      file_path = directory.join(file_name)
      xlsx.serialize(file_path)
      record.update(file: File.open(file_path))

      broadcast :ok
    end

    def export_name
      self.class.name.snakecase
    end

    def file_link
      content_tag(:a, record.file.filename.to_s, href: record.file.url) if record.file.present?
    end

    def xlsx
      raise NoMethodError, 'Define xlsx in subclass'
    end

    def file_name
      raise NoMethodError, 'Define file_name in subclass'
    end

    def campaign_ids
      return record.data['campaign_ids'] if record.data['campaign_ids'].present?

      if record.data['project_ids'].present?
        @campaign_ids ||= Campaign.where(project_id: record.data['project_ids']).pluck(:id)
      end
    end
  end
end
