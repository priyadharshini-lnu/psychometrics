# frozen_string_literal: true

namespace :users_results do
  desc 'Set complete status for expired assigns and users_results'
  task handle_expired: :environment do
    UserAssessment.in_progress.joins(:users_result).
      where('users_results.expiry_date <= :current', current: 10.seconds.from_now).
      find_each do |user_assessment|
      user_assessment.update(status: :timed_out, completion_reason: :time_out_offline)
    end
  end
end
