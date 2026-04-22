# frozen_string_literal: true

# TODO: (atanych) should be replaced with FormObject and Command
module Imports
  module Assessments
    class ResultImportUserResult < Imports::BaseImport # rubocop:disable Metrics/ClassLength
      include ImportExportConst
      # Authorisation flow
      #
      include Pundit
      ## Prepend :administration namespace to policy
      # include Administration::Policies
      include Virtus.model

      attr_accessor :importer, :campaign, :assessment

      attribute :scoring, Boolean, default: false
      attribute :client_id, Integer

      validates :file, file_content_type: { allow: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                    'application/vnd.ms-excel',
                                                    'text/csv',
                                                    'application/octet-stream',
                                                    'text/plain'] }

      def process!
        # Return error if form not valid
        return false unless valid?

        user_results = load_imported_items.compact

        if errors.blank?
          user_results.each do |user_result|
            user_result.save!
            if user_result.completed?
              user_result.user_assessment.save!
              ::UsersResults::SaveScoringWithCallbacksJob.perform_later(user_result, user_result.user)
            end
          end
        end

        errors.blank?
      end

      #
      # Parse file
      # Return array of new Users
      #
      # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity, Metrics/AbcSize
      def load_imported_items
        # Parse header of xls/csv by strict rules
        rows = open_spreadsheet.to_a
        header = rows.shift.map { |h| h.to_s.tr(' ', '').underscore }
        # Remove support row
        SUPPORT_ROWS.times { rows.shift }
        questions = Question.
                    joins(:block).
                    not_deleted.
                    select(:id, :type, :props, :validation).
                    where(blocks: { assessment_id: assessment.id }).
                    order('blocks.position ASC', 'questions.position ASC').
                    group_by(&:id)
        # rubocop:disable Metrics/BlockLength
        rows.each_with_index.map do |row, index|
          row.map! { |value| Utility::String.remove_csv_injection_marker(value) }

          data = header.zip(row).to_h
          # Try to find user_result by encoded id
          begin
            # rubocop:disable Rails/DynamicFindBy
            user_result = UsersResult.find_by_encoded_id(data['result_id']) if data['result_id'].present?
            # rubocop:enable Rails/DynamicFindBy
          rescue ActiveRecord::RecordNotFound
            errors.add(:base, I18n.t('administration.imports.errors.result.invalid_assign', row: index + SKIP_ROWS))
            next
          end

          user_result ||= find_user_result(data, row: index + SKIP_ROWS)

          next unless user_result

          status = I18n.t('activerecord.attributes.users_result.statuses').key(data['status'])
          started_at = parse_date(data['started_at'], index)
          completed_at = parse_date(data['completed_at'], index)

          validate_dates_by_status(status, started_at, completed_at, index)
          validate_question_and_answers(data, questions, index)

          completion_reason = I18n.t('activerecord.attributes.users_result.completion_reasons').
                              key(data['completion_reason'])

          norm_data = parse_norm_data(data['norm'], user_result.assessment_id)
          user_result.user_assessment.assign_attributes(
            completed_at: completed_at,
            norm_id: norm_data[:id],
            status: status,
            completion_reason: completion_reason,
            started_at: started_at,
            selected_locale: data['user_selected_locale']
          )

          parsed_questions = {}
          new_results = {}
          duration = {}
          import_media_from_url = data[IMPORT_MEDIA_FROM_URL_COLUMN].to_s.downcase == 'true'

          # Parse answers
          data.each do |key, value|
            next unless /qid/.match?(key) # rubocop:disable Performance/StringInclude

            # Parse QID and answer's props
            qid, _props = key.split(/\D+/).compact_blank.map(&:to_i)

            next duration[qid] = value if key.include?(DURATION)

            parsed_questions[qid] ||= []
            parsed_questions[qid] << value
          end

          parsed_questions.each do |qid, values|
            question = questions[qid].try(:first)
            next unless question

            question_parser_class = "Imports::Assessments::Questions::#{question.type}"
            unless Question::QUESTIONS_WITH_EXPORTABLE_ANSWERS.include?(question.type)
              Rails.logger.warn("Skipping unsupported question type: #{question.type}")
              next
            end

            begin
              parser = question_parser_class.constantize
            rescue NameError => e
              Rails.logger.error("#{question.type} - #{e}")
              next
            end
            parsed_value = parser.build_answers(values, question, duration[qid], scoring, user_result,
                                                import_media_from_url: import_media_from_url)
            new_results[qid] = parsed_value if parsed_value
          end
          user_result.answers = new_results
          user_result
        end
      # rubocop:enable Metrics/BlockLength

      # Pick up error when header has invalid format
      rescue Roo::HeaderRowNotFoundError
        errors.add(:base, I18n.t('administration.imports.errors.invalid_format'))
        [nil]
      end

      def open_spreadsheet
        case File.extname(file.filename.to_s)
          when '.csv' then Roo::CSV.new(file.url, csv_options: { converters: [:numeric] })
          when '.xlsx' then ::Roo::Excelx.new(file.url)
          else raise I18n.t('administration.imports.errors.unknown_type', filename: file.url)
        end
      end
      # rubocop:enable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity, Metrics/AbcSize

      private

      def find_user_result(data, row:) # rubocop:disable Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
        subject = Users::Regular.find_by(email: data['subject_email'].to_s.downcase, project_id: campaign.project_id)
        unless subject
          add_record_not_found_error('administration.imports.errors.result.user.record_not_found',
                                     identifier: { email: data['subject_email'] }, row: row)
          return
        end

        evaluator_email = data['evaluator_email'].to_s.downcase
        evaluator = if data['relationship'] == 'Assessor' && !campaign&.threesixty?
                      User.find_by(email: evaluator_email, project_id: nil)
                    elsif data['relationship'] && evaluator_email
                      User.find_by(email: evaluator_email, project_id: campaign&.project_id)
                    else
                      subject
                    end

        unless evaluator
          add_record_not_found_error('administration.imports.errors.result.user.record_not_found',
                                     identifier: { email: evaluator_email }, row: row)
          return
        end

        user_assessment = find_user_assessments(subject, evaluator)

        unless user_assessment
          add_record_not_found_error('administration.imports.errors.result.user_assessment.record_not_found',
                                     identifier: { assessment_id: assessment.id }, row: row)
          return
        end

        user_assessment.users_result ||= UsersResult.new
        user_assessment.users_result
      end

      def find_user_assessments(subject, evaluator)
        UserAssessment.find_by(
          subject: subject,
          evaluator: evaluator,
          campaign_id: campaign.id,
          assessment_id: assessment.id
        )
      end

      def parse_norm_data(norm_name, assessment_id)
        return {} if norm_name.blank?

        assessments_table = Assessment.arel_table.alias('assessments')
        dimensions_table = Dimension.arel_table

        assessments_join = dimensions_table.
                           join(assessments_table).
                           on(
                             assessments_table[:dimension_id].eq(dimensions_table[:id]).
                             and(assessments_table[:id].eq(assessment_id))
                           ).
                           join_sources

        norm_ids = Norm.
                   joins(:dimension).
                   joins(assessments_join).
                   where(name: norm_name).
                   pluck(:id)
        { id: norm_ids.try(:first) }
      end

      def parse_date(date, index)
        return nil if date.blank?
        return date if date.is_a?(Date) || date.is_a?(Time)

        DateTime.parse(date.to_s)
      rescue StandardError
        errors.add(:base, I18n.t('administration.imports.errors.result.error',
                                 row: index + SKIP_ROWS, error: "Invalid Date :#{date}"))
      end

      def validate_dates_by_status(status, started_at, completed_at, index) # rubocop:disable Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
        case status
          when :not_started
            date_error(:dates_should_be_empty, index) if started_at.present? || completed_at.present?
          when :in_progress
            date_error(:started_at_required, index) if started_at.blank?
            date_error(:completed_at_should_be_empty, index) if completed_at.present?
          when :completed
            if started_at.blank? || completed_at.blank?
              date_error(:both_dates_required, index)
            elsif completed_at <= started_at
              date_error(:completed_at_should_be_after_started_at, index)
            end
        end

        [started_at, completed_at].each do |date|
          date_error(:dates_not_in_future, index) if date.present? && date > DateTime.current
        end
      end

      def validate_question_and_answers(data, questions, index)
        data.each_key do |key|
          next unless /qid/.match?(key) # rubocop:disable Performance/StringInclude
          next if key.include?(DURATION)

          qid = key.split(/\D+/).compact_blank.map(&:to_i).first
          question = questions[qid].try(:first)
          next if question

          errors.add(:base, I18n.t('administration.imports.errors.result.question_invalid',
                                   row: index + SKIP_ROWS, question_id: qid))

          # Custom validations are designed for profile fields (rich answer objects).
          # Import CSV values have different formats (1-based indices, flat strings) that
          # don't align with backend validation handlers across question types.
          # validation_errors = ::Questions::Validation.call!(question, value)
          # next if validation_errors.blank?

          # errors.add(:base, I18n.t('administration.imports.errors.result.answer_invalid',
          #                          row: index + SKIP_ROWS, question_id: qid, error: validation_errors.join(',')))
        end
      end

      def date_error(error_key, index)
        error = I18n.t("administration.imports.errors.result.date_errors.#{error_key}")
        errors.add(:base, I18n.t('administration.imports.errors.result.invalid_date', row: index + SKIP_ROWS, error:))
      end

      def add_record_not_found_error(translation_key, identifier:, row:)
        errors.add(
          :base,
          I18n.t(
            'administration.imports.errors.result.error',
            error: I18n.t(translation_key, **identifier),
            row: row
          )
        )
      end
    end
  end
end
