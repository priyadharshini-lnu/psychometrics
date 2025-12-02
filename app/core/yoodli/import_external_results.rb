# frozen_string_literal: true

module Yoodli
  class ImportExternalResults
    private_attr_accessor :results, :errors, :processed_user_emails

    def self.call(file: nil, campaign: nil, csv_content: nil)
      new(file, campaign, csv_content: csv_content).call
    end

    def initialize(file = nil, campaign = nil, csv_content: nil)
      @file = file
      @csv_content = csv_content
      @campaign = campaign
      @results = {}
      @errors = []
      @processed_user_emails = Set.new
    end

    def call
      if @csv_content
        parse_csv_content(@csv_content)
      elsif @file
        parse_csv_file(@file)
      else
        @errors << 'No file or CSV content provided'
      end

      save_results

      {
        success: errors.empty?,
        processed_users: processed_user_emails.size,
        processed_user_emails: processed_user_emails.to_a,
        errors: errors,
        results: results
      }
    end

    private

    def parse_csv_file(file)
      csv_result = ::CsvFileParser.call!(file, headers: :first_row)
      csv_result.each do |row|
        process_row(row.to_h)
      end
    rescue StandardError => e
      errors << I18n.t('admin.import_csv_parsing_error', message: e.message)
    end

    def parse_csv_content(content)
      CSVSafe.parse(content, headers: true).each do |row|
        process_row(row.to_h)
      end
    rescue StandardError => e
      errors << I18n.t('admin.import_csv_parsing_error', message: e.message)
    end

    def process_row(row_data)
      email = row_data['userEmail']&.strip&.downcase
      return if email.blank?

      initialize_user_result(email, row_data)
      process_goal_data(email, row_data)
    end

    def initialize_user_result(email, row_data)
      return if results[email].present?

      results[email] = {
        user_info: build_user_info(email, row_data),
        goals: {}
      }
    end

    def build_user_info(email, row_data)
      {
        user_name: row_data['userName'],
        user_id: row_data['userId'],
        email: email,
        signup_date: row_data['signupDate']
      }
    end

    def process_goal_data(email, row_data)
      goal_name = row_data['goalName']&.strip
      return if goal_name.blank?

      results[email][:goals][goal_name] = build_goal_data(row_data)
    end

    def build_goal_data(row_data)
      {
        scenario_id: row_data['scenarioId'],
        scenario_name: row_data['scenarioName'],
        num_attempt_started: row_data['numAttemptStarted']&.to_i,
        first_score: row_data['firstScore']&.to_f,
        max_score: row_data['maxScore']&.to_f,
        last_score: row_data['lastScore']&.to_f,
        avg_score: row_data['avgScore']&.to_f
      }
    end

    def save_results
      yoodli_user_assessments = preload_yoodli_user_assessments

      results.each do |email, user_data|
        yoodli_user_assessment = yoodli_user_assessments[email]
        if save_user_external_results(email, user_data, yoodli_user_assessment)
          processed_user_emails.add(email)
        end
      rescue StandardError => e
        errors << I18n.t('admin.import_error_saving_data', email: email, message: e.message)
      end
    end

    def save_user_external_results(email, user_data, yoodli_user_assessment)
      unless yoodli_user_assessment
        return false
      end

      unless validate_scenario_id(yoodli_user_assessment, user_data)
        errors << I18n.t('admin.import_scenario_id_mismatch',
                         email: email,
                         expected_id: yoodli_user_assessment.user_assessment.assessment.external_assessment_id)
        return false
      end

      users_result = yoodli_user_assessment.users_result

      return false unless users_result

      current_external_results = users_result.external_results || {}
      current_goals = current_external_results['goals'] || {}

      # Skip update if goals haven't changed (normalize for comparison)
      return true if goals_unchanged?(current_goals, user_data[:goals])

      external_results = {
        imported_at: Time.current.iso8601,
        user_info: user_data[:user_info],
        goals: user_data[:goals]
      }

      merged_results = current_external_results.merge(external_results)

      users_result.update!(external_results: merged_results)

      true
    end

    def validate_scenario_id(yoodli_user_assessment, user_data)
      expected_scenario_id = yoodli_user_assessment.user_assessment.assessment.external_assessment_id
      return true if expected_scenario_id.blank?

      user_data[:goals].each_value do |goal_data|
        csv_scenario_id = goal_data[:scenario_id]
        if csv_scenario_id.present? && csv_scenario_id != expected_scenario_id
          return false
        end
      end

      true
    end

    def preload_yoodli_user_assessments
      emails = results.keys
      query = YoodliUserAssessment.
              joins(:user_assessment).
              includes(user_assessment: [:assessment, { users_result: :user_assessment }]).
              where(email: emails, active: true)

      query = query.where(user_assessments: { campaign_id: @campaign.id }) if @campaign

      query.index_by(&:email)
    end

    def goals_unchanged?(current_goals, new_goals)
      normalized_current = current_goals.deep_stringify_keys
      normalized_new = new_goals.deep_stringify_keys

      normalized_current == normalized_new
    end
  end
end
