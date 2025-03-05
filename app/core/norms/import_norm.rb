# frozen_string_literal: true

module Norms
  class ImportNorm < BaseCommand
    private_attr_reader :rows, :job_record, :headers, :dimension_name, :norm_name, :owner, :importer, :norm

    def initialize(rows, owner_id, importer)
      @headers  = rows.headers
      @rows     = rows
      @owner    = Client.find_by(id: owner_id)
      @importer = importer
      @norm_name = headers[0]
      @dimension_name = headers[1]
    end

    def call
      create_norm
      import_factors
      broadcast :ok
    rescue ActiveRecord::RecordInvalid => e
      raise Errors::ImportError, "[#{e.record.model_name}] #{e.record.errors.full_messages[0]}"
    end

    def import_factors
      rows.each do |row|
        factor_name = row['Factors']
        break unless factor_name

        factor = Factor.find_by(dimension_id: dimension.id, name: factor_name)

        unless factor
          raise Errors::ImportError, I18n.t('administration.imports.errors.norm.factor_mismatch',
                                            factor_name: factor_name,
                                            dimension_name: dimension_name)
        end

        import_factor_norms(factor, row)
      end
    end

    def import_factor_norms(factor, row)
      FactorsNorm.transaction do
        factor_norm = factor.factors_norms.find_or_initialize_by(norm_id: norm.id)
        factor_norm.props = []
        FactorsNorm::LEVELS.each do |level|
          score_from = row[level]
          score_to = row[(headers.index(level) + 1)]

          factor_norm.props << { level: level, score_from: score_from, score_to: score_to }
        end
        factor_norm.save!
      end
    end

    def dimension
      @dimension ||= Dimension.find_by(name: headers[1])
    end

    def create_norm
      @norm = Norm.new(
        name: norm_name, dimension_id: dimension.id,
        created_by: @importer, updated_by: @importer, owner: @owner
      )
      @norm.gen_uniq_name if Norm.exists?(name: @norm.name)
      @norm.save!
    end
  end
end
