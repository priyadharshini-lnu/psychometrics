# frozen_string_literal: true

namespace :users_results do
  desc 'Set complete status for expired assigns and users_results'
  task handle_expired: :environment do
    Assign.in_progress.
      where('expiry_date <= :current', current: 10.second.from_now).
      preload(membership: :user).
      find_each do |assign|
        assign.update(status: :timed_out)
      end

    UsersResult.in_progress.where('expiry_date <= :current', current: 10.second.from_now).find_each do |result|
      result.update(status: :timed_out, completion_reason: :time_out_offline)
    end
  end
end
