# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SoftDelete, type: :model do
  with_model :BlogPost do
    table do |t|
      t.datetime :deleted_at
      t.belongs_to :deleted_by, foreign_key: { to_table: :users }, index: { name: :blog_post_user }
      t.boolean :archived, :boolean, default: false
    end

    model do
      include SoftDelete

      has_many :comments, dependent: :restrict_with_error

      scope :archived, -> { where(archived: true) }
      scope :unarchived, -> { where(archived: false) }
    end
  end

  with_model :Comment do
    table do |t|
      t.belongs_to :blog_post
    end
  end

  let(:user) { create(:user) }

  it 'soft_deletes record if there is no restrict_on_error association record present' do
    blog = BlogPost.create
    blog.soft_delete!(user)

    expect(blog.deleted_at).to_not eq(nil)
    expect(blog.deleted_by_id).to eq(user.id)
  end

  it "doesn't soft_delete record if there is restrict_on_error association record present" do
    blog = BlogPost.create
    blog.comments.create
    blog.soft_delete!(user)

    expect(blog.deleted_at).to eq(nil)
    expect(blog.deleted_by_id).to eq(nil)
    expect(blog.errors.full_messages).to eq(['Cannot delete record because dependent comments exist'])
  end

  it 'restores deleted record' do
    blog = BlogPost.create(deleted_at: Time.zone.now, deleted_by: user)
    blog.restore!

    expect(blog.deleted_at).to eq(nil)
    expect(blog.deleted_by_id).to eq(nil)
  end

  it 'returns true for deleted record and vice versa' do
    blog = BlogPost.create
    expect(blog.deleted?).to eq(false)

    blog.soft_delete!(user)
    expect(blog.deleted?).to eq(true)
  end

  describe 'Scopes' do
    it 'deleted' do
      soft_delete_blog = BlogPost.create(deleted_at: Time.zone.now, deleted_by: user)
      not_deleted_blog = BlogPost.create
      deleted_blogs = BlogPost.deleted

      expect(deleted_blogs).to include(soft_delete_blog)
      expect(deleted_blogs).to_not include(not_deleted_blog)
    end

    it 'not_deleted' do
      soft_delete_blog = BlogPost.create(deleted_at: Time.zone.now, deleted_by: user)
      not_deleted_blog = BlogPost.create
      not_deleted_blogs = BlogPost.not_deleted

      expect(not_deleted_blogs).to include(not_deleted_blog)
      expect(not_deleted_blogs).to_not include(soft_delete_blog)
    end

    it 'with_resource_state' do
      active_blog = BlogPost.create
      archieved_blog = BlogPost.create(archived: true)
      deleted_bog = BlogPost.create(deleted_at: Time.zone.now, deleted_by: user)

      expect(BlogPost.with_resource_state('active')).to match_array([active_blog])
      expect(BlogPost.with_resource_state('archived')).to match_array([archieved_blog])
      expect(BlogPost.with_resource_state('deleted')).to match_array([deleted_bog])
    end
  end
end
