module Pundit
  def authorize(record, query = nil, extra_params = {})
    query ||= params[:action].to_s + '?'

    @_pundit_policy_authorized = true

    policy = policy(record, extra_params)

    unless policy.public_send(query)
      raise NotAuthorizedError, query: query, record: record, policy: policy
    end

    true
  end

  def policy(record, extra_params = {})
    policies[record] ||= Pundit.policy!(pundit_user, record, extra_params)
  end

  class << self
    def policy!(user, record, extra_params = {})
      PolicyFinder.new(record).policy!.new(user, record, extra_params)
    end
  end
end
