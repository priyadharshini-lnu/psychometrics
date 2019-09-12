# frozen_string_literal: true

module Exports
  module Reports
    class ReportDataExport
      attr_accessor :report, :client

      def initialize(report, client)
        @report = report
        @client = client
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
            (report.data_configuration['sections'] || []).each do |section|
              # Builds Sub Headers
              sub_headers = build_sub_headers(section).flatten
              sub_headers_size = sub_headers.size - 1

              # Draws Header
              sheet.rows.first.add_cell(section['label'])
              # Adds blank cell for then able to merge
              sub_headers_size.times { sheet.rows.first.add_cell('') }
              # Draws Sub Headers
              sub_headers.each do |sub_header|
                sheet.rows.second.add_cell(sub_header)
              end

              # Merge Header cells to one cell
              cells_range = header_position..(header_position + sub_headers_size)
              sheet.merge_cells sheet.rows.first.cells[cells_range]
              # Calculates next header position
              header_position = cells_range.last + 1
            end

            # TODO: (atanych): too many N+1 queries. Might be resolved by cached_find. https://youtu.be/q8ausBZTrxU?t=400
            current_level_assigns.group_by(&:membership_id).each do |_, assigns|
              results = ::Reports::BuildResults.call(report, assigns)[:ok].flatten
              sheet.add_row(results.map { |r| r[:value] })
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

      private

      # Gets factor title
      #
      def fetch_factor_label(factor_id)
        factor = Factor.select(:id, :name).find_by(id: factor_id)
        factor_alias = factor.aliases.find_by(report_id: report.id)
        factor_alias&.name || factor&.name
      end

      # Builds sub headers
      #
      def build_sub_headers(section)
        sub_headers = section['data'] || []
        sub_headers.map do |sub_header|
          label = sub_header['label']
          label ||= fetch_factor_label(sub_header['factorId']) if sub_header['factorId']

          label || ''
        end
      end
    end
  end
end
