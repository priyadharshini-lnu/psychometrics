# frozen_string_literal: true

module Imports
  module Assessments
    class ImportAgileUserResult < Imports::BaseImport
      include ImportExportConst

      include Virtus.model

      attr_accessor :importer, :campaign, :assessment

      validates :file, file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                    'application/vnd.ms-excel',
                                                    'text/csv',
                                                    'application/octet-stream',
                                                    'text/plain'] }

      def process!
        return false unless valid?

        user_results = load_imported_items.compact

        if user_results.map(&:valid?).all?
          user_results.each(&:save!)
        else
          user_results.each_with_index do |user_result, index|
            user_result.errors.full_messages.each do |message|
              errors.add(:base, I18n.t('administration.imports.errors.result.error',
                                       row: index + SKIP_ROWS, error: message))
            end
          end
        end

        errors.blank?
      end

      def load_imported_items
        rows = open_spreadsheet.to_a
        header = rows.shift.map { |h| h.to_s.tr(' ', '').underscore }

        rows.each_with_index.map do |row, index|
          data = Hash[header.zip(row)]

          begin
            user_result = UsersResult.find_by_encoded_id(data['id']) if data['id'].present?
          rescue ActiveRecord::RecordNotFound
            errors.add(
              :base,
              I18n.t('administration.imports.errors.result.invalid_assign', row: index + SKIP_ROWS)
            )
            next
          end

          user_result ||= find_user_result(data['email'])

          next unless user_result

          user_result.meta_data['completed_groups'] = data['completed_groups'].split(',')

          fixed_headers_size.times { data.shift }

          parsed_question_answers = {}

          form_answers(data, parsed_question_answers)
          user_result.answers = [{}] unless user_result.answers.present?
          user_result.answers[0]['answers'] = parsed_question_answers
          user_result
        end
      end

      def open_spreadsheet
        case File.extname(file.path)
          when '.csv' then Roo::CSV.new(file.url)
          when '.xlsx' then ::Roo::Excelx.new(file.url)
          else raise t('administration.imports.errors.unknown_type', filename: file.url)
        end
      end

      private

      def find_user_result(email)
        user = Users::Regular.find_by(email: email.to_s.downcase, project_id: campaign.project_id)
        unless user
          errors.add(
            :base,
            I18n.t('administration.imports.errors.result.user.record_not_found', email: email)
          )
          return
        end
        user_assessment = find_user_assessments(user)

        unless user_assessment
          errors.add(
            :base,
            I18n.t(
              'administration.imports.errors.result.user_assessment.record_not_found',
              assessment_id: assessment.id
            )
          )
          return
        end

        user_assessment.users_result || user_assessment.users_result.new
      end

      def find_user_assessments(user)
        UserAssessment.find_by(
          subject_id: user.id,
          evaluator_id: user.id,
          campaign_id: campaign.id,
          assessment_id: assessment.id
        )
      end

      def form_answers(data, parsed_question_answers)
        data.each do |key, value|
          qid, prop = key.split(/\.+/).reject(&:blank?)
          next unless qid.present?

          parsed_question_answers[qid] = {} unless parsed_question_answers.key?(qid&.underscore)
          parsed_question_answers[qid][prop] = if AGILE_DATE_FIELDS.include?(prop)
                                                 date_to_timestamp(value)
                                               else
                                                 value
                                               end
        end
      end

      def date_to_timestamp(value)
        DateTime.parse(value).strftime('%Q') if value.present?
      end

      def fixed_headers_size
        ::Assessments::Export::AgileRaw::FIXED_HEADERS.size
      end
    end
  end
end
