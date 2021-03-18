# frozen_string_literal: true

namespace :users_results do
  desc 'Extend scoring of assigns and users_results by calculated score and score_norm'

  task extend_scoring: :environment do
    puts 'Extend scoring of assigns'

    assign_processed = 0
    assign_count = Assign.completed.where.not(scoring: [nil, {}]).size
    Assign.completed.includes(assessment: :dimension).where.not(scoring: [nil, {}]).find_each do |assign|
      assign_processed += 1
      assign.scoring = ::UsersResults::Scoring::Extend.call!(
        assign.scoring, assign.norm_data, assign.assessment.dimension
      )
      assign.save!(validate: false)
      puts "Processed #{assign_processed} assigns out of #{assign_count}" if (assign_processed % 100).zero?
    end

    results_processed = 0
    result_count = UsersResult.completed.where.not(scoring: [nil, {}]).size
    puts 'Extend scoring of users_results'
    UsersResult.completed.includes(user_assessment: { assessment: :dimension }).
      where.
      not(scoring: [nil, {}]).
      find_each do |result|
      results_processed += 1
      result.scoring = ::UsersResults::Scoring::Extend.call!(result.scoring, {}, result.assessment.dimension)
      result.save!(validate: false)
      puts "Processed #{results_processed} users_results out of #{result_count}" if (results_processed % 100).zero?
    end
  end
end
