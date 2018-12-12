module Exports
  module External
    class MindmillExport < BaseExternalExport
      EXPORTING_FIELDS = {
        "nf.attempted": "NF Attempted",
        "nf.correct": "NF Correct",
        "nf.stable": "NF Stable",
        "nf.zscore": "NF Standard Score",
        "nf.adjpercentile": "NF Adjusted Percentile",
        "nf.pc": "NF Percentage Correct",

        "ed.attempted": "ED Attempted",
        "ed.correct": "ED Correct",
        "ed.stable": "ED Stable",
        "ed.zscore": "ED Standard Score",
        "ed.adjpercentile": "ED Adjusted Percentile",
        "ed.pc": "ED Percentage Correct",

        "ti.attempted": "TI Attempted",
        "ti.correct": "TI Correct",
        "ti.stable": "TI Stable",
        "ti.zscore": "TI Standard Score",
        "ti.adjpercentile": "TI Adjusted Percentile",
        "ti.pc": "TI Percentage Correct",

        "oe.attempted": "OE Attempted",
        "oe.correct": "OE Correct",
        "oe.stable": "OE Stable",
        "oe.zscore": "OE Standard Score",
        "oe.adjpercentile": "OE Adjusted Percentile",
        "oe.pc": "OE Percentage Correct",

        "or.attempted": "OR Attempted",
        "or.correct": "OR Correct",
        "or.stable": "OR Stable",
        "or.zscore": "OR Standard Score",
        "or.adjpercentile": "OR Adjusted Percentile",
        "or.pc": "OR Percentage Correct",

        "ab.attempted": "AB Attempted",
        "ab.correct": "AB Correct",
        "ab.stable": "AB Stable",
        "ab.zscore": "AB Standard Score",
        "ab.adjpercentile": "AB Adjusted Percentile",
        "ab.pc": "AB Percentage Correct",

        "rc.attempted": "RC Attempted",
        "rc.correct": "RC Correct",
        "rc.stable": "RC Stable",
        "rc.zscore": "RC Standard Score",
        "rc.adjpercentile": "RC Adjusted Percentile",
        "rc.pc": "RC Percentage Correct",

        "bands.attempted": "BANDS Attempted",
        "bands.correct": "BANDS Correct",
        "bands.stable": "BANDS Stable",
        "bands.zscore": "BANDS Standard Score",
        "bands.adjpercentile": "BANDS Adjusted Percentile",
        "bands.pc": "BANDS Percentage Correct",

        "wr.attempted": "WR Attempted",
        "wr.correct": "WR Correct",
        "wr.stable": "WR Stable",
        "wr.zscore": "WR ",
        "wr.adjpercentile": "WR Adjusted Percentile",
        "wr.pc": "WR Percentage Correct",

        "cpi.zscore": "CPI Standard Score",
        "cpi.percentile": "CPI Percentile"
      }

      # TODO (atanych): we should make global refactoring for exporting later
      # TODO (atanych): right now we dont have much time for it
      def to_xlsx(assigns)
        Axlsx::Package.new do |package|
          package.workbook.add_worksheet(name: 'ExternalResults') do |sheet|
            # TODO (atanych): should be translated exporting fields
            keys = Set.new
            assigns.find_each(batch_size: 100) do |assign|
              keys.merge(EXPORTING_FIELDS.keys.select { |field| assign.external_results && assign.external_results[field.to_s] })
            end
            headers = keys.map { |k| EXPORTING_FIELDS[k] }
            header = ['Result ID', 'Name', 'Email', 'Started At', 'Completed At', 'Status'] + headers

            sheet.add_row(header)
            assigns.find_each(batch_size: 100) do |assign|
              sheet.add_row([
                assign.encode_id,
                assign.user_name,
                assign.user_email,
                assign.started_at.try(:strftime, '%D %r'),
                assign.completed_at.try(:strftime, '%D %r'),
                I18n.t("activerecord.attributes.assign.statuses.#{assign.status}"),
                *external_results(assign, keys)
              ])
            end
          end
        end
      end

      def external_results(assign, keys)
        return [] unless assign.external_results
        keys.map { |field| assign.external_results[field.to_s] }
      end
    end
  end
end
