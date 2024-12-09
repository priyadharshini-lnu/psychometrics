# frozen_string_literal: true

module Campaigns
  module ExternalCampaignScoresImport
    class ImportForm < Rectify::Form
      mimic :campaigns_external_scores_import_form

      STATIC_HEADERS = ['Email'].freeze

      attribute :file, Object

      validates :file, presence: true
      validates :file,
                file_size: { less_than_or_equal_to: 4.megabytes },
                file_content_type: { allow: ['text/csv', 'text/plain'] },
                if: -> { file.is_a?(ActionDispatch::Http::UploadedFile) || file.is_a?(Rack::Test::UploadedFile) }

      validate :validate_headers
      validate :validate_user_emails

      delegate :campaign, to: :context

      def validate_headers
        return if errors.present?

        validate_required_static_headers
        validate_dynamic_headers
      end

      def validate_user_emails
        return if errors.present?

        emails = rows.filter_map { |row| row['Email'] }.uniq # Extract all emails from the rows
        user_emails = User.where(email: emails, project_id: campaign.project_id).pluck(:email)

        missing_users = emails - user_emails

        unless missing_users.empty?
          errors.add(
            :base,
            I18n.t(
              'administration.campaigns_external_scores_import.errors.missing_users',
              emails: missing_users.join(', ')
            )
          )
        end
      end

      def processed_rows
        @processed_rows ||= Campaigns::ExternalCampaignScoresImport::ProcessRows.call!(rows, campaign)
      end

      private

      def validate_required_static_headers
        missing_headers = STATIC_HEADERS.reject { |header| headers.include?(header) }
        return if missing_headers.empty?

        errors.add(
          :base,
          I18n.t(
            'administration.campaigns_external_scores_import.errors.missing_headers',
            headers: missing_headers.join(', ')
          )
        )
      end

      def validate_dynamic_headers
        dynamic_headers = headers - STATIC_HEADERS
        invalid_dynamic_headers = dynamic_headers.reject do |header|
          codes_of_external_score_type.include?(header)
        end

        unless invalid_dynamic_headers.empty?
          errors.add(
            :base,
            I18n.t(
              'administration.campaigns_external_scores_import.errors.invalid_campaign_factor_codes',
              codes: invalid_dynamic_headers.join(', ')
            )
          )
        end
      end

      def headers
        @headers ||= rows.first&.keys || []
      end

      def rows
        csv =
          if file.is_a?(ActionDispatch::Http::UploadedFile) || file.is_a?(Rack::Test::UploadedFile)
            CSV.read(file.path, encoding: 'bom|utf-8', headers: true)
          else
            CSV.new(URI(file.url).open, headers: true).read
          end

        @rows ||= csv.map(&:to_h)
      end

      def codes_of_external_score_type
        @codes_of_external_score_type ||= campaign.campaign_factors.external_score.pluck(:code)
      end
    end
  end
end
