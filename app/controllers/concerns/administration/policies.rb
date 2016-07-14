# Extend Pundit helper for use in administration namespace
module Administration::Policies
  extend ActiveSupport::Concern

  def authorize(record, query = nil)
    record = [:administration, record] unless [record].flatten.include? :administration
    super
  end

  def policy_scope(scope)
    scope = [:administration, scope] unless [scope].flatten.include? :administration
    super
  end

  def policy(record)
    record = [:administration, record] unless [record].flatten.include? :administration
    super
  end
end
