# frozen_string_literal: true

module SuperAdmin
  module ExportExternalAssessment
    class Pearson < Base
      DEFAULT_HEADERS = [
        'Result ID',  'Project ID', 'Project Name', 'Campaign ID', 'Campaign Name', 'Subject Name', 'Subject Email',
        'Started At', 'Completed At', 'Status'
      ].freeze

      def call
        results =
          Axlsx::Package.new do |package|
            package.workbook.add_worksheet(name: 'ExternalResults') do |sheet|
              header_style = package.workbook.styles.add_style(b: true, sz: 14)
              factor_names = users_results.
                             find_by("external_results != '{}'")&.
                             external_results&.
                             map { |factor| factor['name'] } || []

              sheet.add_row(DEFAULT_HEADERS + factor_names, style: header_style)

              users_results.find_each(batch_size: 100) do |res|
                content = factor_names.map do |factor_name|
                  res.external_results&.find { |factors| factors['name'] == factor_name }.try(:[], 'value')
                end
                sheet.add_row(default_content(res) + content)
              end
            end
          end

        broadcast :ok, results
      end

      private

      def default_content(res)
        subject_name = res.subject.decorate.full_name(seprator: ', ')
        subject_email = res.subject.email
        [
          res.encoded_id,
          res.campaign.project.id,
          res.campaign.project.name,
          res.campaign.id,
          res.campaign.name,
          subject_name,
          subject_email,
          res.user_assessment.started_at.try(:strftime, '%D %r'),
          res.user_assessment.completed_at.try(:strftime, '%D %r'),
          I18n.t("activerecord.attributes.users_result.statuses.#{res.real_status}")
        ]
      end
    end
  end
end
