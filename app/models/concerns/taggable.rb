# frozen_string_literal: true

module Taggable
  extend ActiveSupport::Concern

  def save_tag_with_ownership(tags)
    existing_tags = taggings.joins(:tag).pluck('tags.name')
    tags_to_save = tags - existing_tags
    tags_to_remove = existing_tags - tags

    # Save new tags
    tags_to_save.each do |tag_name|
      add_tag(tag_name)
    end

    # Remove tags that are not in the given list
    taggings.joins(:tag).where(tags: { name: tags_to_remove }).destroy_all
  end

  def add_tag(tag_name)
    tag = ActsAsTaggableOn::Tag.find_or_create_by(name: tag_name)

    taggings.build(
      tag_id: tag.id,
      tagger_id: Current.user.id,
      tagger_type: Current.user.class.name,
      context: 'tags',
      tenant: taggable_tenant
    )
  end

  def remove_tag(tag)
    tagging = taggings.joins(:tag).find_by(tag: { name: tag })
    tagging&.destroy
  end

  private

  def taggable_tenant
    public_send(self.class.tenant_column) if self.class.tenant_column
  end
end
