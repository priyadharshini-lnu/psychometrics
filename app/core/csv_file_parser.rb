# frozen_string_literal: true

# Parses a CSV file, either from an uploaded file or a remote URL, with BOM support.
#
# @param file [ActionDispatch::Http::UploadedFile, Rack::Test::UploadedFile, or Object]
#   The file to be parsed, which can be an uploaded file or an object containing a URL.
# @param options [Hash] Options for CSV parsing (e.g., headers: true, encoding: 'utf-8').
# @return [CSV::Table, Array] CSV::Table if headers are true in options, otherwise an Array.
# @raise [Errors::ImportError] For invalid CSV format in uploaded files.
# @raise [Errors::DownloadFailedError] For errors during download or parsing of remote files.

class CsvFileParser < BaseCommand
  attr_accessor :file, :options

  def initialize(file, encoding: 'bom|utf-8', **options)
    @file = file
    @options = options.deep_merge(encoding: encoding)
  end

  def call
    csv_data = parse_csv_file
    broadcast :ok, csv_data
  end

  private

  def parse_csv_file
    if uploaded_file?(file)
      parse_uploaded_file
    else
      fetch_and_parse_csv
    end
  end

  def uploaded_file?(file)
    file.is_a?(ActionDispatch::Http::UploadedFile) || file.is_a?(Rack::Test::UploadedFile) ||
      file.respond_to?(:path)
  end

  def parse_uploaded_file
    CSVSafe.read(file.path, **options)
  end

  def fetch_and_parse_csv
    file_url = file&.url

    return if file_url.blank?

    uri = URI.parse(file_url)

    unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
      raise Errors::DownloadFailedError, I18n.t('administration.errors.invalid_url_format')
    end

    begin
      content = uri.open.read
      # Remove UTF-8 BOM if present (EF BB BF)
      content = content.force_encoding('utf-8').sub("\xEF\xBB\xBF", '')

      CSVSafe.parse(content, **options.except(:encoding))
    rescue CSV::MalformedCSVError => e
      raise Errors::DownloadFailedError, I18n.t('administration.errors.invalid_csv_format', message: e.message)
    rescue URI::InvalidURIError => e
      raise Errors::DownloadFailedError, I18n.t('administration.errors.invalid_url', message: e.message)
    rescue OpenURI::HTTPError, StandardError => e
      raise Errors::DownloadFailedError, I18n.t('administration.errors.download_failed', message: e.message)
    end
  end
end
