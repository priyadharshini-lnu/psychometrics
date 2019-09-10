# frozen_string_literal: true

module Managers
  module Policies
    extend ActiveSupport::Concern

    def authorize(record, query = nil)
      record = [:managers, record] unless [record].flatten.include? :managers
      super
    end

    def policy_scope(scope)
      scope = [:managers, scope] unless [scope].flatten.include? :managers
      super
    end

    def pundit_policy_scope(scope)
      scope = [:managers, scope] unless [scope].flatten.include? :managers
      super
    end

    def policy(record)
      record = [:managers, record] unless [record].flatten.include? :managers
      super
    end
  end
end
