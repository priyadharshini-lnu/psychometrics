# frozen_string_literal: true

module Saville
  class ImportFactors < BaseCommand
    VALID_HEADERS = %w[assessment_id factor_id name score_type value_type].freeze
    VALID_SCORE_TYPE = %w[Raw Ipsative Nipsative Normative].freeze
    VALID_VALUE_TYPE = %w[sten t z percentile rank percentage].freeze

    private_attr_reader :file_url

    def initialize(file_url)
      @file_url = file_url
    end

    def call
      csv = ::Roo::CSV.new(file_url)
      header = nil
      rows = csv.each_with_object([]).with_index do |(row, array), index|
        if index.zero?
          header = row
          validate_headers!(header)
          next
        end

        row_hash = header.zip(row).to_h
        row_hash['value_type'] = row_hash['value_type'].downcase
        validate_row!(row_hash, index)

        array << row_hash
      end
      SavilleFactor.transaction do
        SavilleFactor.delete_all
        SavilleFactor.import rows, validate: false
      end
    end

    def validate_row!(row, index)
      if VALID_SCORE_TYPE.exclude?(row['score_type'])
        raise "Row #{index + 1} has invalid value for score_type. Valid values are #{VALID_SCORE_TYPE}"
      end
      if VALID_VALUE_TYPE.exclude?(row['value_type'])
        raise "Row #{index + 1} has invalid value for value_type. Valid values are #{VALID_VALUE_TYPE}"
      end
    end

    def validate_headers!(header)
      raise "Invalid headers present. Valid headers are #{VALID_HEADERS}" unless (VALID_HEADERS - header).empty?
    end
  end
end
