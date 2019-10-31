# frozen_string_literal: true

module Pundit
  def authorize(record, query = nil, extra_params = {})
    query ||= action_name.to_s + '?'

    @_pundit_policy_authorized = true

    policy = policy(record, extra_params)
    raise NotAuthorizedError, query: query, record: record, policy: policy unless policy.public_send(query)

    true
  end

  def policy(record, extra_params = {})
    policies[record] ||= Pundit.policy!(pundit_user, record, extra_params)
  end

  class << self
    def policy!(user, record, extra_params = {})
      if extra_params[:policy_class]
        extra_params[:policy_class].new(user, record, extra_params)
      else
        PolicyFinder.new(record).policy!.new(user, record, extra_params)
      end
    end
  end
end
