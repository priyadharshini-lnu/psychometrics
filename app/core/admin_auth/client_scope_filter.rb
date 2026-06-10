# frozen_string_literal: true

module AdminAuth
  class ClientScopeFilter
    def self.apply(scope, client)
      return scope unless client

      subtree_ids = client.subtree_ids
      model_class = scope.is_a?(Class) ? scope : scope.klass
      return scope unless model_class.respond_to?(:base_class)

      apply_for_model(scope, model_class.base_class, subtree_ids)
    end

    def self.apply_for_model(scope, base_class, subtree_ids)
      case base_class.name
        when 'Client'
          scope.where(id: subtree_ids)
        when 'User'
          scope.where(project_id: subtree_ids).
            or(scope.where(id: Membership.where(client_id: subtree_ids).select(:user_id)))
        else
          filter_by_client_column(scope, base_class, subtree_ids)
      end
    end

    def self.filter_by_client_column(scope, base_class, subtree_ids)
      columns = base_class.column_names
      has_globals = ActsAsTenant.models_with_global_records.include?(base_class)

      if columns.include?('owner_id')
        filtered = apply_owner_scope(scope, base_class, subtree_ids, has_globals)
        return filtered if filtered
      end

      if columns.include?('client_id')
        result = scope.where(client_id: subtree_ids)
        has_globals ? result.or(scope.where(client_id: nil)) : result
      elsif columns.include?('project_id')
        result = scope.where(project_id: subtree_ids)
        has_globals ? result.or(scope.where(project_id: nil)) : result
      elsif columns.include?('campaign_id')
        scope.where(campaign_id: Campaign.where(project_id: subtree_ids).select(:id))
      else
        scope
      end
    end

    def self.apply_owner_scope(scope, base_class, subtree_ids, has_globals = false)
      reflection = base_class.reflect_on_association(:owner)
      return nil unless reflection
      return nil unless reflection.options[:polymorphic] || reflection.klass == Client

      result = scope.where(owner: Client.where(id: subtree_ids))
      has_globals ? result.or(scope.where(owner_id: nil)) : result
    end

    private_class_method :apply_for_model, :filter_by_client_column, :apply_owner_scope
  end
end
