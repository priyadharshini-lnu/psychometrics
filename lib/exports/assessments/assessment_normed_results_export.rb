# frozen_string_literal: true

module Exports
  module Assessments
    class AssessmentNormedResultsExport
      attr_accessor :assessment, :client

      def initialize(assessment, client_id, _options = {})
        self.assessment = assessment
        self.client = Client.find(client_id)
      end

      def to_xlsx
        Axlsx::Package.new do |package|
          package.workbook.add_worksheet(name: 'AssessmentNormedResults') do |sheet|
            ## header
            header = {
              header: ['Result ID', 'Name', 'Email', 'Started At', 'Completed At', 'Norm Data', 'Status'],
              header2: ['', '', '', '', '', '', '']
            }
            factors = assessment.dimension.factors.active.includes(:sub_factors)
            factor_ids = {}
            normed_results = {}

            # Builds header and creates hash of Factor IDs
            #
            factors.find_each do |factor|
              header[:header] << factor.name
              header[:header2] << ''
              normed_results[factor.id.to_s] = nil
              # Creates an Factor reference with SubFactors
              factor_ids[factor.id] = factor.sub_factor_ids

              factor.sub_factors.each do |sub_factor|
                header[:header] << ''
                header[:header2] << sub_factor.name
                normed_results[sub_factor.id.to_s] = nil
              end
            end

            # Fetchs FactorsNorm and groups by Norm ID, Type and Factor ID
            #
            factors_norms = FactorsNorm.
                            where(factor_id: normed_results.keys).
                            group_by { |fn| "#{fn.norm_id}_#{fn.type}_#{fn.factor_id}" }

            # Draws headers
            #
            sheet.add_row header[:header].flatten
            sheet.add_row header[:header2].flatten

            # Draws results
            #
            current_level_assigns.find_each(batch_size: 100) do |assign|
              norm_data = assign.norm_data || {}
              norm = Norm.find_by(id: norm_data['id']) if norm_data['id']

              # Iterates Factor IDs for calculate normed result
              #
              normed_results.keys.each do |factor_id|
                # Gets results by Factor ID
                scoring = assign.scoring&.dig(factor_id, 'results')
                normed_results[factor_id] = ''

                # Gets sub_factor results
                if scoring.blank? && !factor_ids[factor_id.to_i].blank?
                  scoring = factor_ids[factor_id.to_i].
                            each_with_object([]) { |sub_factor_id, res| res << assign.scoring&.dig(sub_factor_id.to_s, 'results') }.
                            flatten.compact
                end

                # Skip if there is no scoring or norm
                next if scoring.blank? || norm.nil?

                # Detects FactorsNorm and skip if there is no
                factors_norm = factors_norms["#{norm.id}_#{norm_data['type']}_#{factor_id}".downcase]&.first
                next unless factors_norm

                # Calculates sum of value
                sum_scoring = scoring.inject(0) { |sum, result| sum + result['value'].to_i }
                # Calculates avg of value with 2 numbers after comma
                avg_scoring = (sum_scoring / scoring.size.to_f).round(2)

                prop = (factors_norm.props || []).
                       detect { |item| item['score_from'].to_f <= avg_scoring && item['score_to'].to_f >= avg_scoring }

                # Converts level to index
                normed_result = FactorsNorm::LEVELS.index(prop&.dig('level'))
                # +1 cause (Very Low = 1, Low = 2, Average = 3, High = 4, Very High = 5)
                normed_results[factor_id] = normed_result + 1 if normed_result
              end

              sheet.add_row [assign.encode_id,
                             assign.user_name,
                             assign.user_email,
                             assign.started_at.try(:strftime, '%D %r'),
                             assign.completed_at.try(:strftime, '%D %r'),
                             norm ? "#{norm.name}:#{assign.norm_data['type']}" : '',
                             I18n.t("activerecord.attributes.assign.statuses.#{assign.status}"),
                             *normed_results.values]
            end
          end
        end
      end

      def current_level_assigns
        if client.project?
          project_level_assigns
        else
          subproject_level_assigns
        end
      end

      private

      def project_level_assigns
        Queries::Assigns::ProjectLevel::ByClientAndAssessment.call(client.id, assessment.id).
          selecting do
          [id,
           scoring,
           norm_data,
           status,
           completed_at,
           started_at,
           membership.user.last_name.op('||', quoted(', ')).op('||', membership.user.first_name).as('user_name'),
           membership.user.email.as('user_email')]
        end
      end

      def subproject_level_assigns
        Queries::Assigns::SubProjectLevel::ByClientAndAssessment.call(client.id, assessment.id).
          selecting do
          [id,
           scoring,
           norm_data,
           status,
           completed_at,
           started_at,
           original_assign.membership.user.last_name.op('||', quoted(', ')).op('||', original_assign.membership.user.first_name).as('user_name'),
           original_assign.membership.user.email.as('user_email')]
        end
      end
    end
  end
end
