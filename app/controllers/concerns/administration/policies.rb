# Extend Pundit helper for use in administration namespace
module Administration
  module Policies
    extend ActiveSupport::Concern

    def authorize(record, query = nil)
      new_record = [:administration, record].flatten
      record = new_record unless [record].flatten.include? :administration
      super
    end

    def policy_scope(scope)
      new_scope = [:administration, scope].flatten
      scope = new_scope unless [scope].flatten.include? :administration
      super
    end

    def pundit_policy_scope(scope)
      new_scope = [:administration, scope].flatten
      scope = new_scope unless [scope].flatten.include? :administration
      super
    end

    def policy(record)
      new_record = [:administration, record].flatten
      record = new_record unless [record].flatten.include? :administration
      super
    end
  end
end
