module Exports
  module Assessments
    class CompletionStatusExport
      def initialize(client_id)
        @client_id = client_id
      end

      def to_xlsx
        Axlsx::Package.new do |package|
          package.workbook.add_worksheet(name: 'CompletionStatus') do |sheet|
            header_style = package.workbook.styles.add_style(b: true, sz: 14)
            header = ['Result ID', 'Name', 'Email', 'Assessment Type', 'Assessment Name', 'Started At', 'Completed At', 'Status']
            sheet.add_row(header, style: header_style)
            current_level_assigns.find_each(batch_size: 100) do |assign|
              sheet.add_row [assign.encode_id,
                             assign.user_name,
                             assign.user_email,
                             I18n.t("activerecord.attributes.assessment.categories.#{Assessment::CATEGORIES.key(assign.category)}"),
                             assign.name,
                             assign.started_at.try(:strftime, '%D %r'),
                             assign.completed_at.try(:strftime, '%D %r'),
                             I18n.t("activerecord.attributes.assign.statuses.#{assign.status}")]
            end
          end
        end
      end

      def current_level_assigns
        client = Client.find(@client_id)
        if client.project?
          project_level_assigns
        else
          subproject_level_assigns
        end
      end

      private

      def project_level_assigns
        Queries::Assigns::ProjectLevel::ByClient.call(@client_id).
          selecting { [id,
                       membership.user.last_name.op('||', quoted(', ')).op('||', membership.user.first_name).as('user_name'),
                       membership.user.email.as('user_email'),
                       assessment.category,
                       assessment.name,
                       started_at,
                       completed_at,
                       status] }
      end

      def subproject_level_assigns
        Queries::Assigns::SubProjectLevel::ByClient.call(@client_id).
          selecting { [id,
                       original_assign.membership.user.last_name.op('||', quoted(', ')).op('||', original_assign.membership.user.first_name).as('user_name'),
                       original_assign.membership.user.email.as('user_email'),
                       assessment.category,
                       assessment.name,
                       started_at,
                       completed_at,
                       status] }
      end
    end
  end
end
