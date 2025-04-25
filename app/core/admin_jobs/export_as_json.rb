# frozen_string_literal: true

module AdminJobs
  class ExportAsJson < AdminJobs::Base
    def valid?
      resource.present?
    end

    def call
      export_class.new(resource).serialize.to_json
      File.write(file_path, export_class.new(resource).serialize.to_json)
      record.file.attach(
        io: File.open(file_path),
        filename: File.basename(file_path)
      )
      job_record.complete!
      FileUtils.rm_f(file_path)

      broadcast :ok
    end

    def export_class
      raise "Implement export_class in #{self.class.name}"
    end

    def generate_details
      [[I18n.t('common.text.file'), file_link]]
    end

    def file_name
      raise NoMethodError, 'Define file_name in subclass'
    end

    def file_path
      return @file_path if defined?(@file_path)

      directory = Rails.root.join('tmp', export_name, record.id.to_s)
      FileUtils.mkdir_p(directory)
      @file_path ||= directory.join(file_name)
    end

    def export_name
      self.class.name.underscore
    end
  end
end
