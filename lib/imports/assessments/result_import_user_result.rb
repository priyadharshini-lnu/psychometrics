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
        imported_items = load_imported_items.compact

        if imported_items.map(&:valid?).all?
          imported_items.each(&:save!)
        else
          imported_items.each_with_index do |item, index|
            item.errors.full_messages.each do |message|
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
          data = Hash[header.zip(row)]
          # Try to find user_result by encoded id
          begin
            user_result = UsersResult.find_by_encoded_id(data['result_id']) if data['result_id'].present?
          rescue ActiveRecord::RecordNotFound
            errors.add(:base, I18n.t('administration.imports.errors.result.invalid_assign', row: index + SKIP_ROWS))
            return [nil]
          end

          # If UserResult not found, going to create user
          unless user_result
            user = Users::Regular.
                   find_by(users: { email: data['email'].to_s.downcase }, project_id: campaign.project_id)
            user ||= find_or_create_user(data, index)
            next unless user

            user_result = UsersResult.find_or_create_by(
              subject_id: user.id,
              evaluator_id: user.id,
              campaign_id: campaign.id,
              assessment_id: assessment.id
            )

            UserAssessment.find_or_create_by(
              subject_id: user.id,
              evaluator_id: user.id,
              campaign_id: campaign.id,
              assessment_id: assessment.id,
              project_id: campaign.project_id,
              users_result_id: user_result.id
            )
          end

          status = I18n.t('activerecord.attributes.users_result.statuses').key(data['status'])
          completion_reason = I18n.t('activerecord.attributes.users_result.completion_reasons').
                              key(data['completion_reason'])

          norm_data = parse_norm_data(data['norm'], user_result.assessment_id)
          user_result.assign_attributes(
            created_at: parse_date(data['started_at'], index),
            completed_at: parse_date(data['completed_at'], index),
            norm_id: norm_data[:id],
            norm_type: norm_data[:type],
            status: status,
            completion_reason: completion_reason
          )

          parsed_questions = {}
          new_results = {}
          duration = nil

          # Parse answers
          data.each do |key, value|
            next unless /qid/.match?(key)

            next duration = value if key.include?(DURATION)

            # Parse QID and answer's props
            qid, _props = key.split(/\D+/).reject(&:blank?).map(&:to_i)
            parsed_questions[qid] ||= []
            parsed_questions[qid] << value
          end

          parsed_questions.each do |qid, values|
            question = questions[qid].try(:first)
            next unless question

            begin
              parser = "Imports::Assessments::Questions::#{question.type}".constantize
            rescue NameError => e
              p "#{question.type} - #{e}"
              next
            end
            parsed_value = parser.build_answers(values, question, duration, scoring, user_result)
            new_results[qid] = parsed_value if parsed_value
          end
          user_result.answers = new_results
          if user_result.completed?
            ::UsersResults::Recompute.call!(
              user_result,
              user_result.user,
              norm_id: user_result.norm_id,
              norm_type: user_result.norm_type
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
        case File.extname(file.path)
          when '.csv' then Roo::CSV.new(file.url)
          when '.xlsx' then ::Roo::Excelx.new(file.url)
          else raise t('administration.imports.errors.unknown_type', filename: file.url)
        end
      end
      # rubocop:enable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity, Metrics/AbcSize

      private

      def find_or_create_user(data, index)
        first_name, last_name = data['name']&.split(', ')
        # TODO: Remove password and uncommit Invite
        user = Users::Regular.
               create_with(
                 first_name: first_name,
                 last_name: last_name,
                 password: 'password',
                 password_confirmation: 'password',
                 project_id: campaign.project_id
               ).
               find_or_create_by(email: data['email'])
        if user.errors.any?
          errors.add(:base, I18n.t('administration.imports.errors.result.error',
                                   row: index + SKIP_ROWS, error: user.errors.full_messages.first))
          nil
        end
      end

      def parse_norm_data(norm_data, assessment_id)
        return {} if norm_data.nil?

        norm_name, norm_type = norm_data.to_s.split(':')
        norm = Norm.
               joining { dimension }.
               joining do
          dimension.assessments.alias('assessments').
            on((dimension.assessments.dimension_id == dimension.id) & (dimension.assessments.id == assessment_id))
        end.
               where(name: norm_name).
               pluck(:id)
        { id: norm.try(:first), type: norm_type }
      end

      def parse_date(date, index)
        return nil unless date.present?
        return date if date.is_a?(Date) || date.is_a?(Time)

        DateTime.strptime(date.to_s, '%D %r')
      rescue StandardError
        errors.add(:base, I18n.t('administration.imports.errors.result.error',
                                 row: index + SKIP_ROWS, error: 'Invalid Date :' + date.to_s))
      end
    end
  end
end
