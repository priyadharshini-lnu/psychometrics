# frozen_string_literal: true

class HandleUserResultExpiryJob < ApplicationJob
  # Set complete status for expired users_results
  def perform
    users_results_form = ::UsersResults::UpdatingForm.from_params(
      status: :timed_out,
      completion_reason: :time_out_offline
    )
    UsersResult.joins(:user_assessment).
      merge(UserAssessment.in_progress).
      where('user_assessments.expiry_date <= :current', current: 10.seconds.from_now).find_each do |result|
        ::UsersResults::UpdateUsersResult.call(users_results_form, result, result.user)
      end
  end
end
