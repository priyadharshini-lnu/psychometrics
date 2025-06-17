# frozen_string_literal: true

class AdminJobs::ExportDashboardAsFile < AdminJobs::Base
  def call
    file_stream = PowerBi::FileExportService.new(record.data).call
    File.binwrite(file_path, file_stream)
    record.file.attach(
      io: File.open(file_path),
      filename: File.basename(file_path),
      content_type: content_type
    )

    FileUtils.rm_f(file_path)

    job_record.complete!

    broadcast :ok
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

  def file_name
    "dashboard-#{record.data['dashboard_id']}.#{format.downcase}"
  end

  def generate_details
    [[I18n.t('common.text.file'), file_link]]
  end

  def format
    record.data['format'] || 'PDF'
  end

  def content_type
    case format
      when 'PDF'
        'application/pdf'
      when 'PPTX'
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      else
        'application/octet-stream'
    end
  end
end
