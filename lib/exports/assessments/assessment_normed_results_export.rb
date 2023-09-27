# frozen_string_literal: true

module Exports
  module Assessments
    class AssessmentNormedResultsExport
      attr_accessor :assessment, :client

      def initialize(assessment, client_id, _options = {})
        self.assessment = assessment
        self.client = Client.find(client_id)
      end

      # rubocop:disable Metrics/BlockLength
      def to_xlsx
        Axlsx::Package.new do |package|
          package.workbook.add_worksheet(name: 'AssessmentNormedResults') do |sheet|
            ## header
            header = {
              header: ['Result ID', 'Name', 'Email', 'Started At', 'Completed At', 'Norm Data', 'Status']
            }
            factors = assessment.dimension.all_factors.active.includes(:sub_factors).index_by(&:id)
            factor_ids = {}
            normed_results = {}

            # Builds header and creates hash of Factor IDs
            #
            factors.each do |factor_id, factor|
              header[:header] << factor.name
              normed_results[factor_id] = nil
              factor_ids[factor_id] = factor.sub_factor_ids
            end

            # Draws headers
            #
            sheet.add_row header[:header].flatten

            # Draws results
            #
            current_level_assigns.find_each(batch_size: 100) do |assign|
              normed_results.each_key do |factor_id|
                normed_results[factor_id] = assign.scoring&.dig(factor_id.to_s, 'norm_score')
              end

              norm = Norm.find_by(id: assign.norm_data['id']) if assign.norm_data.try(:[], 'id')

              sheet.add_row [assign.encode_id,
                             user_name(assign),
                             assign.user_email,
                             assign.started_at.to_s,
                             assign.completed_at.to_s,
                             norm ? norm.name : '',
                             I18n.t("activerecord.attributes.assign.statuses.#{assign.status}"),
                             *normed_results.values]
            end
          end
        end
      end
      # rubocop:enable Metrics/BlockLength

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
           membership.user.first_name.as('user_first_name'),
           membership.user.last_name.as('user_last_name'),
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
           original_assign.membership.user.first_name.as('user_first_name'),
           original_assign.membership.user.last_name.as('user_last_name'),
           original_assign.membership.user.email.as('user_email')]
        end
      end

      def user_name(assign)
        [assign.user_first_name, assign.user_last_name].compact_blank.join(', ')
      end
    end
  end
end
