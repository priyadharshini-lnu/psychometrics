module Imports
  module Xls
    class NormImport < Imports::BaseImport
      # take out to another file, if client must configure this
      XLS_CONFIG = {
          factor_start_row:  4,
          factor_start_ceil: 2,
          pages_count:       2
      }.freeze

      def initialize(file, importer)
        super(file, importer)
        @cursor_x = 0
        @cursor_y = 0
      end

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
        import_by_sheet_name(@current_sheet.sheet_name)
        import_factors
        import_sub_factors
      end

      def import_by_sheet_name(sheet_name)
        sheet_name_arr     = sheet_name.split
        @current_norm_type = sheet_name_arr.pop.downcase
        @norm              = Norm.create!(name: sheet_name_arr.join(''), updated_by: @importer.id) unless @norm
        @dimension         = Dimension.create!(name: sheet_name_arr.join('')) unless @dimension
      end

      def import_factors
        factor_start_ceil = XLS_CONFIG[:factor_start_ceil] - 1
        factor_start_row  = XLS_CONFIG[:factor_start_row] - 1
        (factor_start_row...@current_sheet.count).each do |i|
          factor_name = @current_sheet[i][factor_start_ceil].value if @current_sheet[i] && @current_sheet[i][factor_start_ceil]
          break unless factor_name
          @cursor_x = factor_start_ceil
          @cursor_y = i
          factor    = Factor.where(dimension_id: @dimension.id, name: factor_name).first
          factor    = @dimension.factors.create!(name: factor_name) unless factor
          import_factor_norms(factor, i, factor_start_ceil + 1)
        end
      end

      def import_sub_factors
        factor_start_ceil = XLS_CONFIG[:factor_start_ceil] - 1
        factor_start_row  = nil
        (@cursor_y...@current_sheet.count).each do |i|
          if @current_sheet[i] && @current_sheet[i][0] && @current_sheet[i][0].value
            factor_start_row = i
            break
          end
        end
        (factor_start_row + 1...@current_sheet.count).each do |i|
          @cursor_x       = 0
          @cursor_y       = i
          factor_name     = @current_sheet[i][0].value if @current_sheet[i] && @current_sheet[i][0]
          sub_factor_name = @current_sheet[i][1].value if @current_sheet[i] && @current_sheet[i][1]
          break unless factor_name
          factor = Factor.where(dimension_id: @dimension.id, name: factor_name).first
          unless factor
            raise Errors::ImportError, I18n.t('administration.imports.errors.norm.factor_is_not_described',
                                              coords: human_coordinates,
                                              factor: factor_name)
          end
          sub_factor = Factor.where(dimension_id: @dimension.id, name: sub_factor_name, parent_id: factor.id).first
          sub_factor = @dimension.factors.create!(name: sub_factor_name, parent_id: factor.id) unless sub_factor
          import_factor_norms(sub_factor, i, factor_start_ceil + 1)
        end
      end

      def import_factor_norms(factor, row, ceil)
        (ceil...ceil + FactorsNorm::LEVELS.size * 2).each_slice(2) do |score_from, score_to|
          @cursor_x = score_from
          factor.factors_norms.create!(
            score_from: @current_sheet[row][score_from].value,
            score_to:   @current_sheet[row][score_to].value,
            level:      @current_sheet[XLS_CONFIG[:factor_start_row] - 2][score_from].value,
            type:       @current_norm_type,
            norm_id:    @norm.id
          )
        end
      end

      def human_coordinates
        "#{(@cursor_y + 1)}-#{(@cursor_x + 1).alph.upcase}"
      end
    end
  end
end
