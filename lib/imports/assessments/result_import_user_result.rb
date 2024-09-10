# frozen_string_literal: true

# TODO: (atanych) should be replaced with FormObject and Command
module Imports
  module Assessments
    class ResultImportUserResult < Imports::BaseImport
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

        # errors.add(:base, I18n.t('administration.imports.errors.result.invalid_assign', row: 1))
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
                    joining { block }.
                    not_deleted.
                    selecting { [id, type, props] }.
                    where.has { |q| q.block.assessment_id == assessment.id }.
                    ordering { [block.position.asc, position.asc] }.
                    group_by(&:id)
        # rubocop:disable Metrics/BlockLength
        rows.each_with_index.map do |row, index|
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

          user_result ||= find_user_result(data['subject_email'])

          next unless user_result

          status = I18n.t('activerecord.attributes.users_result.statuses').key(data['status'])
          completion_reason = I18n.t('activerecord.attributes.users_result.completion_reasons').
                              key(data['completion_reason'])

          norm_data = parse_norm_data(data['norm'], user_result.assessment_id)
          user_result.user_assessment.update!(
            completed_at: parse_date(data['completed_at'], index),
            norm_id: norm_data[:id],
            status: status,
            completion_reason: completion_reason,
            started_at: parse_date(data['started_at'], index)
          )

          parsed_questions = {}
          new_results = {}
          duration = {}

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

            begin
              parser = "Imports::Assessments::Questions::#{question.type}".constantize
            rescue NameError => e
              Rails.logger.error("#{question.type} - #{e}")
              next
            end
            parsed_value = parser.build_answers(values, question, duration[qid], scoring, user_result)
            new_results[qid] = parsed_value if parsed_value
          end
          user_result.answers = new_results
          if user_result.completed?
            ::UsersResults::Recompute.call!(
              user_result,
              user_result.user
            )
          end
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
          else raise t('administration.imports.errors.unknown_type', filename: file.url)
        end
      end
      # rubocop:enable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity, Metrics/AbcSize

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

      def parse_norm_data(norm_name, assessment_id)
        return {} if norm_name.blank?

        norm_ids = Norm.
                   joining { dimension }.
                   joining do
          dimension.assessments.alias('assessments').
            on((dimension.assessments.dimension_id == dimension.id) & (dimension.assessments.id == assessment_id))
        end.
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
    end
  end
end
