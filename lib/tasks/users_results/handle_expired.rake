# frozen_string_literal: true

namespace :users_results do
  desc 'Set complete status for expired assigns and users_results'
  task handle_expired: :environment do
    assign_form = AssignForm.from_params(status: :completed)
    Assign.in_progress.
      where('expiry_date <= :current', current: 10.second.from_now).
      preload(membership: :user).
      find_each do |assign|
        UpdateAssign.call(assign_form, assign, assign.membership.user)
      end

    users_results_form = ::UsersResults::UpdatingForm.from_params(
      status: :completed,
      completion_reason: :time_out_offline
    )
    UsersResult.in_progress.where('expiry_date <= :current', current: 10.second.from_now).find_each do |result|
      ::UsersResults::UpdateUsersResult.call(users_results_form, result, result.user)
    end
  end
end
