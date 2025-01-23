# frozen_string_literal: true

module Reports
  class ExportData < BaseCommand
    private_attr_reader :report, :campaign, :header_style, :sub_header_style, :content_style, :configuration_sections,
                        :resources

    def initialize(report, campaign)
      @report = report
      @campaign = campaign
      @configuration_sections = report.data_configuration['sections'] || []
      @resources = ::Reports::GetDataConfigurationResources.call!(report)
    end

    def call # rubocop:disable Metrics/AbcSize
      package = ExcelSafe.new

      workbook = package.workbook
      add_workbook_styles(workbook)
      package.add_worksheet('ReportDataExport') do |sheet|
        # Draws two blank rows for header
        #
        sheet.add_row [], style: header_style
        sheet.add_row [], style: header_style

        # Draws headers and collect data
        #
        header_position = 0
        configuration_sections.each do |section|
          # Builds Sub Headers
          sub_headers = build_sub_headers(section).flatten
          sub_headers_size = sub_headers.size - 1

          # Draws Header
          sheet.rows.first.add_cell(section['label'], style: header_style)
          # Adds blank cell for then able to merge
          sub_headers_size.times { sheet.rows.first.add_cell('') }
          # Draws Sub Headers
          sub_headers.each do |sub_header|
            sheet.rows.second.add_cell(sub_header, style: sub_header_style)
          end

          # Merge Header cells to one cell
          cells_range = header_position..(header_position + sub_headers_size)
          sheet.merge_cells sheet.rows.first.cells[cells_range]
          # Calculates next header position
          header_position = cells_range.last + 1
        end

        users_results.includes(:subject).group_by(&:subject_id).each do |_, results|
          results = ::Reports::BuildResults.call(report, results, resources)[:ok].flatten
          sheet.add_row(results.pluck(:value), style: content_style)
        end
      end

      broadcast :ok, package
    end

    private

    def users_results
      UsersResult.includes(:user_assessment).where(
        user_assessments: { assessment_id: report.assessment_ids, campaign_id: campaign.id }
      )
    end

    def add_workbook_styles(workbook)
      @header_style = workbook.styles.add_style(
        border: { style: :thin, color: '000000' },
        bg_color: 'CFCECE',
        alignment: { horizontal: :center, vertical: :center },
        b: true
      )
      @sub_header_style = workbook.styles.add_style(
        border: { style: :thin, color: '000000' },
        bg_color: 'E7E6E5',
        alignment: { horizontal: :center, vertical: :center },
        b: true
      )
      @content_style = workbook.styles.add_style(
        border: { style: :thin, color: '000000' }
      )
    end

    # Builds sub headers
    #
    def build_sub_headers(section)
      sub_headers = section['data'] || []
      sub_headers.map do |sub_header|
        label = sub_header['label']
        label ||= ref_label(sub_header['ref']) if sub_header['type'] == 'ref'
        label ||= resources.dig(:factor_names, sub_header['factorId']) if sub_header['factorId']
        label ||= sub_header['key'].humanize if sub_header['key']
        label || ''
      end
    end

    def ref_label(ref)
      refs = report.data_configuration['refs'] || []
      refs.find { |r| r['ref_id'] == ref }&.dig('label')
    end
  end
end
