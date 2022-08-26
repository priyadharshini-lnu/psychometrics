# frozen_string_literal: true

module Assessments
  module Export
    class Mindmill < BaseCommand
      private_attr_accessor :assessment, :campaign

      EXPORTING_FIELDS = {
        'nf.attempted': 'NF Attempted',
        'nf.correct': 'NF Correct',
        'nf.stable': 'NF Stable',
        'nf.zscore': 'NF Standard Score',
        'nf.adjpercentile': 'NF Adjusted Percentile',
        'nf.pc': 'NF Percentage Correct',

        'ed.attempted': 'ED Attempted',
        'ed.correct': 'ED Correct',
        'ed.stable': 'ED Stable',
        'ed.zscore': 'ED Standard Score',
        'ed.adjpercentile': 'ED Adjusted Percentile',
        'ed.pc': 'ED Percentage Correct',

        'ti.attempted': 'TI Attempted',
        'ti.correct': 'TI Correct',
        'ti.stable': 'TI Stable',
        'ti.zscore': 'TI Standard Score',
        'ti.adjpercentile': 'TI Adjusted Percentile',
        'ti.pc': 'TI Percentage Correct',

        'oe.attempted': 'OE Attempted',
        'oe.correct': 'OE Correct',
        'oe.stable': 'OE Stable',
        'oe.zscore': 'OE Standard Score',
        'oe.adjpercentile': 'OE Adjusted Percentile',
        'oe.pc': 'OE Percentage Correct',

        'or.attempted': 'OR Attempted',
        'or.correct': 'OR Correct',
        'or.stable': 'OR Stable',
        'or.zscore': 'OR Standard Score',
        'or.adjpercentile': 'OR Adjusted Percentile',
        'or.pc': 'OR Percentage Correct',

        'ab.attempted': 'AB Attempted',
        'ab.correct': 'AB Correct',
        'ab.stable': 'AB Stable',
        'ab.zscore': 'AB Standard Score',
        'ab.adjpercentile': 'AB Adjusted Percentile',
        'ab.pc': 'AB Percentage Correct',

        'rc.attempted': 'RC Attempted',
        'rc.correct': 'RC Correct',
        'rc.stable': 'RC Stable',
        'rc.zscore': 'RC Standard Score',
        'rc.adjpercentile': 'RC Adjusted Percentile',
        'rc.pc': 'RC Percentage Correct',

        'bands.attempted': 'BANDS Attempted',
        'bands.correct': 'BANDS Correct',
        'bands.stable': 'BANDS Stable',
        'bands.zscore': 'BANDS Standard Score',
        'bands.adjpercentile': 'BANDS Adjusted Percentile',
        'bands.pc': 'BANDS Percentage Correct',

        'wr.attempted': 'WR Attempted',
        'wr.correct': 'WR Correct',
        'wr.stable': 'WR Stable',
        'wr.zscore': 'WR ',
        'wr.adjpercentile': 'WR Adjusted Percentile',
        'wr.pc': 'WR Percentage Correct',

        'cpi.zscore': 'CPI Standard Score',
        'cpi.percentile': 'CPI Percentile'
      }.freeze

      def initialize(assessment, campaign)
        @assessment = assessment
        @campaign = campaign
      end

      def call
        results = Axlsx::Package.new do |package|
          package.workbook.add_worksheet(name: 'ExternalResults') do |sheet|
            keys = Set.new
            users_results.find_each(batch_size: 100) do |res|
              keys.merge(EXPORTING_FIELDS.keys.select do |field|
                           res.external_results && res.external_results[field.to_s]
                         end)
            end
            headers = keys.map { |k| EXPORTING_FIELDS[k] }
            header = ['Result ID', 'Name', 'Email', 'Started At', 'Completed At', 'Status'] + headers

            sheet.add_row(header)
            users_results.find_each(batch_size: 100) do |res|
              sheet.add_row([
                              res.encoded_id,
                              user_name(res),
                              res.user.email,
                              res.created_at.try(:strftime, '%D %r'),
                              res.completed_at.try(:strftime, '%D %r'),
                              I18n.t("activerecord.attributes.users_result.statuses.#{res.status}"),
                              *external_results(res, keys)
                            ])
            end
          end
        end

        broadcast :ok, results
      end

      private

      def external_results(res, keys)
        return [] unless res.external_results

        keys.map { |field| res.external_results[field.to_s] }
      end

      def users_results
        UsersResult.joins(:user_assessment).
          where(user_assessments: { assessment_id: assessment.id, campaign_id: campaign.id }).
          includes(user_assessment: :evaluator)
      end

      def user_name(res)
        [res.user.first_name, res.user.last_name].reject(&:blank?).join(', ')
      end
    end
  end
end
