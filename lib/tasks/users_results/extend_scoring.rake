# frozen_string_literal: true

namespace :users_results do
  desc 'Extend scoring of assigns and users_results by calculated score and score_norm'

  task extend_scoring: :environment do
    puts 'Extend scoring of assigns'
    Assign.completed.find_each do |assign|
      assign.scoring = ::UsersResults::Scoring::Extend.call!(assign.scoring, assign.norm_data)
      assign.save!(validate: false)
    end

    puts 'Extend scoring of users_results'
    UsersResult.completed.find_each do |result|
      result.scoring = ::UsersResults::Scoring::Extend.call!(result.scoring, {})
      result.save!(validate: false)
    end
  end
end
