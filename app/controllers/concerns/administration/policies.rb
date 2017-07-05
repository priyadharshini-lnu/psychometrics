# Extend Pundit helper for use in administration namespace
module Administration
  module Policies
    extend ActiveSupport::Concern

    def authorize(record, query = nil)
      record = define_scope(record)
      super
    end

    def policy_scope(scope)
      scope = define_scope(scope)
      super
    end

    def pundit_policy_scope(scope)
      scope = define_scope(scope)
      super
    end

    def policy(record)
      record = define_scope(record)
      define_policy(record) || super
    end

    private

    # overwrite in controller
    def define_policy(record)
      nil
    end

    def define_scope(object)
      object = [:administration, object].flatten if [object].flatten.index(:administration).nil?
      object
    end
  end
end
