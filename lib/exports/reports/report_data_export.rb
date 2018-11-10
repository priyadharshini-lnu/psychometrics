# frozen_string_literal: true

module Exports
  module Reports
    class ReportDataExport
      attr_accessor :report, :client

      def initialize(report_id, client_id, _options = {})
        self.report = Report.find(report_id)
        self.client = Client.find(client_id)
      end

      def to_xlsx
        Axlsx::Package.new do |package|
          package.workbook.add_worksheet(name: 'ReportDataExport') do |sheet|
            header_style = sheet.styles.add_style(
              bg_color: 'FFFF0000',
              alignment: { horizontal: :center, vertical: :center }
            )

            # Draws two blank rows for header
            #
            sheet.add_row [], style: header_style
            sheet.add_row [], style: header_style

            # Draws headers and collect data
            #
            header_position = 0
            export_data = []
            (report.data_configuration['sections'] || []).each do |section|
              subheaders = (section['data'] || [])
              subheaders_size = subheaders.size - 1

              # Draws header
              sheet.rows.first.add_cell(section['label'])
              # Adds blank cell for then able to merge
              subheaders_size.times { sheet.rows.first.add_cell('') }
              # Draws Sub Headers
              subheaders.each do |subheader|
                label = subheader['label']
                label ||= fetch_factor_label(subheader['factorId']) if subheader['factorId']
                sheet.rows.second.add_cell(label || '')
                export_data << subheader
              end
              # Merge Header cells to one cell
              cells_range = header_position..(header_position + subheaders_size)
              sheet.merge_cells sheet.rows.first.cells[cells_range]
              # Calculates next header position
              header_position = cells_range.last + 1
            end

            current_level_assigns.find_each do |assign|
              # next unless assign.id == 82542
              results = export_data.map { |data| self.try(data['type'].to_s, assign, data) || '' }
              sheet.add_row results
            end
          end
        end
      end

      def current_level_assigns
        if client.project?
          Queries::Assigns::ProjectLevel::ByClientAndReport.call(client.id, report.id)
        else
          Queries::Assigns::SubProjectLevel::ByClientAndReport.call(client.id, report.id)
        end
      end

      # Gets user data
      #
      def user_data(assign, data)
        assign.membership.user.try(data['key']) || ''
      end

      # Calculates value for external_result type
      #
      def external_result(assign, data)
        # Skip if the assign is for another assessment
        return unless assign.assessment_id == data['assessmentId']

        assign.try(:external_results).try(:[], data['key'])
      end

      # Calculates value for normed_factor type
      #
      def normed_factor(assign, data)
        # Skip if the assign is for another assessment
        return unless assign.assessment_id == data['assessmentId']
        # Skip if the assign has no norm data
        return unless assign.norm_data
        # Skip if can't find factor
        factor = Factor.find(data['factorId'])
        # Fetchs Norm
        norm = Norm.find(assign.norm_data['id'])
        # Fetchs FactorsNorm by Norm ID and Type
        factors_norm = factor.factors_norms.find_by!(norm_id: norm.id, type: assign.norm_data['type'].to_s.downcase)
        # Gets scoring
        scoring = assign.scoring&.dig(factor.id.to_s, 'results') || []
        # Detects normed result
        factors_norm.detect_normed_result(scoring)

      rescue ActiveRecord::RecordNotFound
      end

      # Calculates value for formula type
      #
      def formula(assign, data)
        formula_op = data.dig('formula', 'op')
        results = (data.dig('formula', 'args') || []).map { |arg| self.try(arg['type'], assign, arg) }.compact
        return if results.blank?
        return (results.inject(0.0, :+) / results.size.to_f).round(2) if formula_op == 'AVERAGE'
        return results.min if formula_op == 'MIN'
        results.max
      end

      private

      # Gets factor title
      #
      def fetch_factor_label(factor_id)
        factor = Factor.select(:id, :name).find_by(id: factor_id)
        factor_alias = factor.aliases.find_by(report_id: report.id)
        factor_alias&.name || factor&.name
      end
    end
  end
end
