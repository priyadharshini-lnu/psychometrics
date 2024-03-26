# frozen_string_literal: true

ActsAsTaggableOn::Tag.instance_eval do
  scope :accessible_to_clients, lambda { |tenants|
    taggings_table = ActsAsTaggableOn.taggings_table

    joins(:taggings).
      where("#{taggings_table}.tenant IN (?) OR " \
            "#{taggings_table}.tenant IS NULL",
            tenants.map(&:to_s)).
      select("DISTINCT #{taggings_table}.*")
  }

  def ransackable_attributes(_auth_object = nil)
    %w[name]
  end

  def ransackable_associations(_auth_object = nil)
    []
  end
end
