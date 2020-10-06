# frozen_string_literal: true

class HandleUserResultExpiryJob < ApplicationJob
  # Set complete status for expired assigns and users_results
  def perform
    assign_form = AssignForm.from_params(status: :completed)
    Assign.in_progress.
      where('expiry_date <= :current', current: 10.second.from_now).
      preload(membership: :user).
      find_each do |assign|
        UpdateAssign.call(assign_form, assign, assign.membership.user)
      end

    users_results_form = ::UsersResults::UpdatingForm.from_params(status: :completed)
    UsersResult.in_progress.where('expiry_date <= :current', current: 10.second.from_now).find_each do |result|
      ::UsersResults::UpdateUsersResult.call(users_results_form, result, result.user)
    end
  end
end
