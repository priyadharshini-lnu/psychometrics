# frozen_string_literal: true

module Imports
  module Xls
    class NormImport
      def initialize(file, importer)
        @importer = importer
        @file     = file
        @cursor_x = 0
        @cursor_y = 0
      end

      # take out to another file, if client must configure this
      XLS_CONFIG = {
        factor_start_row: 4,
        factor_start_ceil: 2,
        pages_count: 2
      }.freeze

      def process
        ActiveRecord::Base.transaction do
          sheets = RubyXL::Parser.parse(@file)
          (0...XLS_CONFIG[:pages_count]).each do |i|
            import_by_sheet(sheets[i])
          end
        end
        true
      rescue ActiveRecord::RecordInvalid => e
        raise Errors::ImportError, "[#{e.record.model_name}] [#{human_coordinates}] #{e.record.errors.full_messages[0]}"
      end

      private

      def import_by_sheet(sheet)
        @current_sheet = sheet
        import_by_sheet_name(@current_sheet.sheet_name, @current_sheet[0].try(:[], 0).try(:value))
        import_factors
        import_sub_factors
      end

      def import_by_sheet_name(sheet_name, dimension_name)
        raise Errors::ImportError, I18n.t('administration.imports.errors.norm.not_set_dimension') if !@dimension && !dimension_name

        sheet_name_arr     = sheet_name.split
        @current_norm_type = sheet_name_arr.pop.downcase
        unless @dimension
          @dimension     = Dimension.find_by(name: dimension_name)
          @new_dimension = true unless @dimension
          @dimension ||= Dimension.create(name: dimension_name)
        end
        unless @norm
          @norm = Norm.new(name: sheet_name_arr.join(' '), dimension_id: @dimension.id, updated_by: @importer.id)
          @norm.gen_uniq_name if Norm.exists?(name: @norm.name)
          @norm.save!
        end
      end

      def import_factors
        factor_start_ceil = XLS_CONFIG[:factor_start_ceil] - 1
        factor_start_row  = XLS_CONFIG[:factor_start_row] - 1
        (factor_start_row...@current_sheet.count).each do |i|
          factor_name = @current_sheet.try(:[], i).try(:[], factor_start_ceil).try(:value)
          break unless factor_name

          @cursor_x = factor_start_ceil
          @cursor_y = i
          factor    = Factor.find_by(dimension_id: @dimension.id, name: factor_name)
          if !factor && !@new_dimension
            raise Errors::ImportError, I18n.t('administration.imports.errors.norm.factors_mismatch',
                                              coords:    human_coordinates,
                                              dimension: @dimension.name,
                                              factor:    factor_name)
          end
          factor ||= @dimension.factors.create!(name: factor_name)
          import_factor_norms(factor, i, factor_start_ceil + 1)
        end
      end

      def import_sub_factors
        factor_start_ceil = XLS_CONFIG[:factor_start_ceil] - 1
        factor_start_row  = nil
        (@cursor_y...@current_sheet.count).each do |i|
          if @current_sheet.try(:[], i).try(:[], 0).try(:value)
            factor_start_row = i
            break
          end
        end
        (factor_start_row + 1...@current_sheet.count).each do |i|
          @cursor_x       = 0
          @cursor_y       = i
          factor_name     = @current_sheet.try(:[], i).try(:[], 0).try(:value)
          sub_factor_name = @current_sheet.try(:[], i).try(:[], 1).try(:value)
          break unless factor_name

          factor = Factor.where(dimension_id: @dimension.id, name: factor_name).first
          unless factor
            raise Errors::ImportError, I18n.t('administration.imports.errors.norm.factor_is_not_described',
                                              coords: human_coordinates,
                                              factor: factor_name)
          end
          sub_factor = Factor.where(dimension_id: @dimension.id, name: sub_factor_name, parent_id: factor.id).first
          if !sub_factor && !@new_dimension
            raise Errors::ImportError, I18n.t('administration.imports.errors.norm.sub_factors_mismatch',
                                              coords:    human_coordinates,
                                              dimension: @dimension.name,
                                              factor:    factor_name)
          end
          sub_factor ||= @dimension.sub_factors.create!(name: sub_factor_name, parent_id: factor.id)
          import_factor_norms(sub_factor, i, factor_start_ceil + 1)
        end
      end

      def import_factor_norms(factor, row, ceil)
        raw_range = (ceil...ceil + FactorsNorm::LEVELS.size * 2)
        return if @current_sheet[row][raw_range].map(&:value).compact.empty?

        factors_norm       = FactorsNorm.new(type: @current_norm_type, norm_id: @norm.id, factor_id: factor.id)
        factors_norm.props = []
        raw_range.each_slice(2) do |score_from, score_to|
          @cursor_x = score_from
          factors_norm.props << {
            score_from: @current_sheet[row][score_from].try(:value).try(:round, 5),
            score_to: @current_sheet[row][score_to].try(:value).try(:round, 5),
            level: @current_sheet[XLS_CONFIG[:factor_start_row] - 2][score_from].try(:value)
          }
        end
        factors_norm.save
      end

      def human_coordinates
        "#{(@cursor_y + 1)}-#{(@cursor_x + 1).alph.upcase}"
      end
    end
  end
end
