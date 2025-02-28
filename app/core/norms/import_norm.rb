# frozen_string_literal: true

module Norms
  class ImportNorm < BaseCommand
    private_attr_reader :rows, :job_record, :headers

    def initialize(rows, owner_id, importer)
      @headers  = rows.headers
      @rows     = rows
      @owner    = Client.find_by(id: owner_id)
      @importer = importer
    end

    def call
      import_factors
      broadcast :ok
    rescue Errors::ImportError => e
      broadcast :error, e.message
    end

    def import_factors
      rows.each do |row|
        factor_name = row['Factors']
        break unless factor_name

        factor = Factor.find_by(dimension_id: dimension.id, name: factor_name)

        raise Errors::ImportError, "Factor #{factor_name} not found" unless factor

        import_factor_norms(factor, row)
      end
    end

    def import_factor_norms(factor, row)
      FactorsNorm.transaction do
        factor_norm = factor.factors_norms.find_or_initialize_by(norm_id: norm.id)
        factor_norm.props = []
        FactorsNorm::LEVELS.each do |level|
          score_from = row[level]
          score_to = row[(headers[level] + 1)]

          factor_norm.props << { level: level, score_from: score_from, score_to: score_to }
        end
        factor_norm.save!
      end
    end

    def dimension
      @dimension ||= Dimension.find_by(name: headers[1])
    end

    def norm
      norm_name = headers[0]
      @norm = Norm.new(
        name: norm_name, dimension_id: dimension.id,
        created_by: @importer, updated_by: @importer, owner: @owner
      )
      @norm.gen_uniq_name if Norm.exists?(name: @norm.name)
      @norm.save!
      @norm
    end
  end
end
