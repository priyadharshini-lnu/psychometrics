# frozen_string_literal: true

module Assessments
  module Export
    class Saville < BaseCommand
      private_attr_accessor :assessment, :campaign

      def initialize(assessment, campaign)
        @assessment = assessment
        @campaign = campaign
      end

      def call
        package = ExcelSafe.new

        savile_factors.each do |score_type, factors_hash|
          package.add_worksheet(score_type) do |sheet|
            add_headers_and_sub_headers(factors_hash, sheet)

            users_results.find_each(batch_size: 100) do |result|
              add_score(result, factors_hash.values.flatten, sheet)
            end
          end
        end

        broadcast :ok, package
      end

      private

      def add_score(result, factors, sheet)
        score_hash = (result.external_results['scores'] || []).each_with_object({}) do |score, acc|
          acc["#{score['id']}.#{score['score_type']}.#{score['value_type']}"] = score['score']
        end

        data = default_content(result)
        factors.each do |factor|
          data << score_hash["#{factor.factor_id}.#{factor.score_type}.#{factor.value_type}"]
        end

        sheet.add_row(data)
      end

      def default_content(result)
        [
          result.encoded_id,
          user_name(result),
          result.evaluator.email,
          I18n.t("activerecord.attributes.users_result.statuses.#{result.real_status}"),
          result.user_assessment.started_at&.strftime('%D %r'),
          result.completed_at&.strftime('%D %r')
        ]
      end

      def default_headers
        ['Result ID', 'Full Name', 'Email', 'Status', 'Started at', 'Completed at']
      end

      def user_name(result)
        [result.evaluator.first_name, result.evaluator.last_name].compact_blank.join(', ')
      end

      def add_headers_and_sub_headers(factors_hash, sheet)
        header_style = sheet.workbook.styles.add_style(b: true, sz: 14)
        factor_id_headers = default_headers
        factor_name_headers = [nil] * factor_id_headers.length
        factor_value_type_headers = [''] * default_headers.length
        factors_hash.each do |factor_id, factors|
          factor_id_headers.concat([factor_id] * factors.length)
          factor_name_headers.concat([factor_id_and_name[factor_id]] * factors.length)
          factor_value_type_headers.concat(factors.map(&:value_type))
        end.flatten

        sheet.add_row(factor_id_headers, style: header_style)
        sheet.add_row(factor_name_headers, style: header_style)
        sheet.add_row(factor_value_type_headers, style: header_style)
      end

      def users_results
        UsersResult.
          where(user_assessments: { campaign_id: campaign.id, assessment_id: assessment.id }).
          includes(:user_assessment, :evaluator)
      end

      def savile_factors
        @savile_factors ||=
          SavilleFactor.where(assessment_id: assessment.external_settings[:assessment_id]).
          group_by(&:score_type).
          transform_values do |factors|
            factors.group_by(&:factor_id).transform_values { |f| f.uniq(&:value_type) }
          end
      end

      def factor_id_and_name
        @factor_id_and_name ||= SavilleFactor.where(assessment_id: assessment.external_settings[:assessment_id]).
                                pluck(:factor_id, :name).to_h
      end
    end
  end
end
