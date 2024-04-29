# frozen_string_literal: true

module CampaignUsers
  module AssignReportsAndAssessments
    class ImportForm < Rectify::Form
      mimic :user

      attribute :import_data, Array
      validate :validate_header
      validate :validate_body
      validate :validate_campaign_users
      validate :validate_bundle_reports_licences

      private

      def validate_header
        if (['Email', 'Report Bundle Id', 'Report Id', 'Assessment Id', 'Norm Id'] - import_data.first).any?
          errors.add(:import_data, :invalid_reports_header)
        end
      end

      def validate_body
        reports_data = Report.where(id: reports_ids).joins(:assessments).group(:id).
                       select('id', 'array_agg(assessments_reports.assessment_id) as assessments_ids').group_by(&:id)

        report_bundles_data = ReportFamily.where(id: report_bundles_ids).joins(:reports).group(:id).
                              select('id', 'array_agg(reports.id) as reports_ids').group_by(&:id)

        import_data[1..].each.with_index do |attrs, index|
          form = ::CampaignUsers::AssignReportsAndAssessments::Import::CreateForm.new(attrs).
                 with_context(campaign: context.campaign, reports_data: reports_data,
                              report_bundles_data: report_bundles_data)
          if form.invalid?
            form.errors.each do |error|
              errors.add(:import_data, "Row #{index + 1}: #{error.message}")
            end
          end
        end
      end

      def validate_campaign_users
        rows = import_data[1..]
        batches = (rows.size / 100) + 1
        batches.times do |batch|
          batch_rows = rows[batch * 100, 100]
          users = context.campaign.users.where(email: batch_rows.pluck(:email))

          batch_rows.each.with_index do |attrs, index|
            user = users.find { |u| u.email == attrs[:email].downcase }
            unless user
              errors.add(:import_data,
                         I18n.t('assign_reports.errors.user_not_found',
                                row: (batch * 100) + (index + 1), email: attrs[:email]))
            end
          end
        end
      end

      def validate_bundle_reports_licences
        bundle_ids = report_bundles_ids.uniq
        licenses = Licenses::FetchQuery.new(context.campaign.client, bundle_ids).query
        bundle_ids.each do |bundle_id|
          license = licenses.find { |l| l.report_family_id == bundle_id.to_i }
          unless license
            errors.add(:import_data, I18n.t('assign_reports.errors.not_enought_licenses', bundle_id: bundle_id))
          end
        end
      end

      def report_bundles_ids
        @report_bundles_ids ||= import_data[1..].pluck(:report_bundle_id)
      end

      def reports_ids
        @reports_ids ||= import_data[1..].pluck(:report_id)
      end

      def assessments_ids
        @assessments_ids ||= import_data[1..].pluck(:assessment_id)
      end
    end
  end
end
