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

      def process! # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
        return false unless valid?

        user_results = load_imported_items&.compact

        return false unless user_results

        if user_results.map(&:valid?).all?
          user_results.each(&:save!)
          user_results.each do |user_result|
            next unless user_result.completed?

            ::UsersResults::Recompute.call!(
              user_result,
              user_result.user
            )
          end
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

      def load_imported_items # rubocop:disable Metrics/AbcSize
        rows = open_spreadsheet.to_a
        header = rows.shift

        fixed_headers, question_headers = header.partition.with_index do |_, index|
          index < fixed_headers_size
        end

        fixed_headers = fixed_headers.map { |h| h.to_s.tr(' ', '').underscore }

        header = fixed_headers + question_headers

        question_header_question_ids = question_headers.map { |h| h.split('.').compact_blank[0] }.uniq

        unless question_header_question_ids.all? { |question_id| assessment_question_ids.include?(question_id) }
          errors.add(
            :base,
            I18n.t('administration.imports.errors.result.question_mismatch')
          )
          return
        end

        rows.each_with_index.map do |row, index|
          data = header.zip(row).to_h

          user_result ||= find_user_result(data['email'])

          next unless user_result

          status = I18n.t('activerecord.attributes.users_result.statuses', locale: :en).key(data['status'])

          norm_id = parsed_norm_id(data['norm'], user_result.assessment_id)

          user_result.user_assessment.update!(
            completed_at: parse_date(data['completed_at'], index),
            norm_id: norm_id,
            status: status,
            started_at: parse_date(data['started_at'], index)
          )

          user_result.meta_data['completed_groups'] = data['completed_groups']&.split(',')

          fixed_headers_size.times { data.shift }

          user_result.answers = form_answers(data)

          user_result
        end
      end

      def open_spreadsheet
        case File.extname(file.path)
          when '.csv' then Roo::CSV.new(file.url, csv_options: { converters: [:numeric] })
          when '.xlsx' then ::Roo::Excelx.new(file.url)
          else raise t('administration.imports.errors.unknown_type', filename: file.url)
        end
      end

      private

      def assessment_question_ids
        config = Agile.find_by(assessment_id: assessment.id).try(:config)
        scene_type = 'AssessmentScene'

        config['groups'].collect { |group| group['scenes'].select { |scene| scene['type'] == scene_type } }.
          select { |scene| scene.size.positive? }.
          flatten(1).
          flat_map { |scene| scene.dig('data', 'blocks') }.
          flat_map { |blocks| blocks['questions'] }.
          collect { |question| question['id'] }
      end

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
          campaign_id: campaign.id,
          assessment_id: assessment.id,
          subject_id: user.id
        )
      end

      def parsed_norm_id(norm_name, assessment_id)
        return {} if norm_name.blank?

        @parsed_norm_id ||= {}

        if @parsed_norm_id[norm_name].blank?
          norm_ids = Norm.joining { dimension }.joining do
            dimension.assessments.alias('assessments').
              on((dimension.assessments.dimension_id == dimension.id) & (dimension.assessments.id == assessment_id))
          end.where(name: norm_name).pluck(:id)
          @parsed_norm_id[norm_name] = norm_ids.try(:first)
        end
        @parsed_norm_id[norm_name]
      end

      def form_answers(data)
        row = {}
        data.each do |key, value|
          qid, prop = key.split('.').compact_blank
          next if qid.blank?

          row[qid] = {} if row[qid].blank?
          row[qid][prop] = if AGILE_DATE_FIELDS.include?(prop)
                             date_to_timestamp(value)
                           elsif prop == 'answers'
                             value.to_s.split(',')
                           else
                             value
                           end
        end

        row.reject { |_k, v| v['id'].blank? }.
          group_by { |_k, v| v['group_id'] }.
          transform_values { |answers| { 'answers' => answers.to_h, 'group_id' => answers[0][1]['group_id'] } }.
          values
      end

      def parse_date(date, index)
        return nil if date.blank?
        return date if date.is_a?(Date) || date.is_a?(Time)

        DateTime.parse(date.to_s)
      rescue StandardError
        errors.add(:base, I18n.t('administration.imports.errors.result.error',
                                 row: index + SKIP_ROWS, error: "Invalid Date :#{date}"))
      end

      def date_to_timestamp(value)
        DateTime.parse(value).strftime('%Q') if value.present?
      end

      def fixed_headers_size
        ::AdminJobs::AgileRawResultExport::FIXED_HEADERS.size
      end
    end
  end
end
