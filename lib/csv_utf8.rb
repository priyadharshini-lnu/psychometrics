# frozen_string_literal: true

require 'csv-safe'

class CsvUtf8
  def self.write(file_path)
    CSVSafe.open(file_path, 'wb:utf-8') do |csv|
      csv.to_io.write "\uFEFF".encode('utf-8')

      yield(csv) if block_given?
    end
  end

  def self.read(file_path)
    CSV.read(file_path, encoding: 'bom|utf-8')
  end

  def self.to_array(file_path)
    read(file_path).to_a
  end
end
