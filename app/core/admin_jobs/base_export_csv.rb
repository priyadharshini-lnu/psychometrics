# frozen_string_literal: true

module AdminJobs
  class BaseExportCsv < AdminJobs::Base
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    def call
      directory = Rails.root.join('tmp', export_name, record.id.to_s)
      FileUtils.mkdir_p(directory)
      file_path = directory.join(file_name)
      File.write(file_path, render.html_safe)
      record.update(file: File.open(file_path))
      broadcast :ok
    end

    def render
      ApplicationController.render csv_template, locals: locals, layout: nil
    end

    def export_name
      self.class.name.snakecase
    end

    def file_link
      content_tag(:a, record.file.real_filename, href: record.file.url) if record.file.present?
    end

    def csv_template
      raise NoMethodError, 'csv tempalte not defined in subclass'
    end

    def locals
      raise NoMethodError, 'Define locals in subclass'
    end

    def file_name
      raise NoMethodError, 'Define file_name in subclass'
    end
  end
end
