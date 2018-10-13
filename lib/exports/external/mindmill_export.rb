module Exports
  module External
    class MindmillExport < BaseExternalExport
      EXPORTING_FIELDS = %w(or.attempted nf.zxscore)

      # TODO (atanych): we should make global refactoring for exporting later
      # TODO (atanych): right now we dont have much time for it
      def to_xlsx(assigns)
        Axlsx::Package.new do |package|
          package.workbook.add_worksheet(name: 'ExternalResults') do |sheet|
            # TODO (atanych): should be translated exporting fields
            header = {
              header: ['Result ID', 'Name', 'Email', 'Started At', 'Completed At', 'Status'] + EXPORTING_FIELDS,
              header2: ['', '', '', '', '', ''],
              header3: ['', '', '', '', '', '']
            }
            sheet.add_row(header[:header])
            sheet.add_row(header[:header2])
            sheet.add_row(header[:header3])
            assigns.find_each(batch_size: 100) do |assign|
              sheet.add_row([
                assign.encode_id,
                assign.user_name,
                assign.user_email,
                assign.started_at.try(:strftime, '%D %r'),
                assign.completed_at.try(:strftime, '%D %r'),
                I18n.t("activerecord.attributes.assign.statuses.#{assign.status}"),
                *external_results(assign)
              ])
            end
          end
        end
      end

      def external_results(assign)
        return [] unless assign.external_results
        EXPORTING_FIELDS.map { |field| assign.external_results[field] }
      end
    end
  end
end
