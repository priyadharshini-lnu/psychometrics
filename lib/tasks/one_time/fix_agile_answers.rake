# frozen_string_literal: true

require 'tty-progressbar'

namespace :one_time do
  task :fix_agile_answers, %i[assessment_id] => %i[environment] do |_, args|
    dry_run = ENV.fetch('DRY_RUN', 'true') == 'true'

    puts 'Dry run: No changes will be applied!' if dry_run
    abort 'Please specify an assessment id' if args[:assessment_id].blank?

    assessment = Assessment.find(args[:assessment_id])
    abort 'Not a valid AGILE assessment' unless assessment.agile?

    questions = JsonPath.new('$.groups.*.scenes[?(@.type=="AssessmentScene")].data.blocks.*.questions').
                on(assessment.agile.config).flatten(1).index_by { |q| q['id'] }
    query = UserAssessment.where(assessment: assessment, status: :completed)
    bar = TTY::ProgressBar.new('Updating [:bar] :current/:total :eta', total: query.count)
    query.find_each do |user_assessment|
      user_result = user_assessment.users_result
      fix_user_result(user_result, questions, dry_run)
      bar.advance(1)
    end
  end

  def has_positive_score?(scoring, question_id)
    scoring.any? do |_, scoring_item|
      scoring_item['results']&.any? { |r| r['value'].positive? && r['question_id'] == question_id }
    end
  end

  # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
  def fix_user_result(user_result, questions, dry_run)
    answers = user_result.answers
    scoring = user_result.scoring

    return if scoring.blank? || answers.blank?

    answers_updated = false
    # pp answers
    answers.each do |group|
      group['answers'].each_value do |question_answer|
        question = questions[question_answer['id']]
        next if question.blank?
        next unless ['edg-', 'ftp-'].any? { |prefix| question['id'].starts_with?(prefix) }
        next if question['answers'].blank?

        next unless has_positive_score?(scoring, question['id'])

        next if question['answers'].intersect?([question_answer['answers']])

        question_answer['answers'] = question['answers'].first
        answers_updated = true
      end
    end
    # pp answers
    user_result.update_column('answers', answers) if answers_updated && !dry_run
  end
  # rubocop:enable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
end
