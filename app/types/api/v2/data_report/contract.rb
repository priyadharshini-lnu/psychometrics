# frozen_string_literal: true

module Api
  module V2
    module DataReport
      class Contract < Api::Base::Contract
        rule(data: { attributes: :report_type }) do
          next unless value

          unless ::DataReport.report_types.key?(value)
            key.failure('is not a valid report type')
          end
        end

        private

        def parse_configuration(value)
          Oj.load(value)
        rescue Oj::ParseError
          nil
        end

        def validate_project_ids(project_ids, scope, client_id, required: scope == 'client')
          if required && project_ids.blank?
            return I18n.t('admin.project_ids_required')
          end
          return nil if project_ids.blank?

          projects = ::Project.where(id: project_ids)
          return invalid_project_ids_error(project_ids, projects) if projects.count != project_ids.count

          validate_client_ownership(projects, scope, client_id)
        end

        def invalid_project_ids_error(project_ids, projects)
          invalid_ids = project_ids - projects.pluck(:id)
          I18n.t('admin.invalid_project_ids', ids: invalid_ids.join(', '))
        end

        def validate_client_ownership(projects, scope, client_id)
          return unless scope == 'client' && client_id.present?

          projects.each do |project|
            next if project.tte_id == client_id.to_i

            return I18n.t('admin.project_not_related_to_client',
                          project_id: project.id)
          end

          nil
        end
      end
    end
  end
end
