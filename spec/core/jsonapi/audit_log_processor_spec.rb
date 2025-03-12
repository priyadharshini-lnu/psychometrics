# frozen_string_literal: true

require 'rails_helper'

require Rails.root.join('spec/fixtures/models/base_resource.rb')
Rails.root.glob('spec/fixtures/**/*.rb').each { |file| require file }

describe JsonApi::AuditLogProcessor do
  let(:conn) { ActiveRecord::Base.connection }
  let(:user) { create(:user) }
  let(:post) { Dummy::Post.create }
  let(:author) { Dummy::Author.create(name: 'Smith') }
  let(:campaign) { create(:campaign) }

  it 'logs index action' do
    data = process_operations('dummy/posts', 'index', user, { q: 'q1' })

    audit_log = AuditLog.find_by(record_type: 'Dummy::Post', action: 'index', payload: data[:params], user: user)
    expect(audit_log.present?).to eq(true)
  end

  it 'logs show action' do
    process_operations('dummy/posts', 'show', user, { id: post.id })

    audit_log = AuditLog.find_by(record_id: post.id, record_type: 'Dummy::Post', action: 'show', user: user)
    expect(audit_log.present?).to eq(true)
  end

  it 'logs create action' do
    data = process_operations(
      'dummy/posts', 'create', user, { data: { type: 'posts', attributes: { title: 'title' } } }
    )

    audit_log = AuditLog.find_by(record_type: 'Dummy::Post', action: 'create', payload: data[:params], user: user)
    expect(audit_log.present?).to eq(true)
    expect(audit_log.record_id.present?).to eq(true)
  end

  it 'logs update action' do
    data = process_operations(
      'dummy/posts', 'update', user, { data: { type: 'posts', id: post.id, attributes: { title: 'title' } } }
    )

    audit_log = AuditLog.find_by(
      record_id: post.id, record_type: 'Dummy::Post', action: 'update', payload: data[:params], user: user
    )
    expect(audit_log.present?).to eq(true)
  end

  it 'logs show_relationship action' do
    data = process_operations(
      'dummy/posts', 'show_relationship', user, { post_id: post.id, relationship: 'author' }
    )

    audit_log = AuditLog.find_by(
      record_id: post.id, record_type: 'Dummy::Post', action: 'show_relationship', payload: data[:params], user: user
    )
    expect(audit_log.present?).to eq(true)
  end

  it 'logs show_relationship action' do
    data = process_operations(
      'dummy/authors', 'get_related_resource', user, { post_id: post.id, relationship: 'author', source: 'dummy/post' }
    )
    audit_log = AuditLog.find_by(
      record_id: post.id, record_type: 'Dummy::Post', action: 'show_related_resource', payload: data[:params],
      user: user
    )
    expect(audit_log.present?).to eq(true)
  end

  it 'logs show_relationships action' do
    data = process_operations(
      'dummy/comments', 'get_related_resources', user, { post_id: post.id, relationship: 'comments',
                                                         source: 'dummy/post' }
    )

    audit_log = AuditLog.find_by(
      record_id: post.id, record_type: 'Dummy::Post', action: 'show_related_resources', payload: data[:params],
      user: user
    )
    expect(audit_log.present?).to eq(true)
  end

  it 'logs remove_to_one_relationship action' do
    author = post.create_author(name: 'Jack')
    data = process_operations(
      'dummy/posts', 'destroy_relationship', user, {
        post_id: post.id, relationship: 'author', data: { type: 'authors', id: author.id }
      }
    )

    audit_log = AuditLog.find_by(
      record_id: post.id, record_type: 'Dummy::Post', action: 'remove_to_one_relationship', payload: data[:params],
      user: user
    )
    expect(audit_log.present?).to eq(true)
  end

  it 'logs replace_to_one_relationship action' do
    data = process_operations(
      'dummy/posts', 'update_relationship', user, {
        post_id: post.id, relationship: 'author', data: { type: 'authors', id: author.id }
      }
    )

    audit_log = AuditLog.find_by(
      record_id: post.id, record_type: 'Dummy::Post', action: 'replace_to_one_relationship', payload: data[:params],
      user: user
    )
    expect(audit_log.present?).to eq(true)
  end

  it 'logs create_to_many_relationships action' do
    comment = Dummy::Comment.create(text: 'Text')
    data = process_operations(
      'dummy/posts', 'create_relationship', user, {
        post_id: post.id, relationship: 'comments', data: [{ type: 'comments', id: comment.id }]
      }
    )
    audit_log = AuditLog.find_by(
      record_id: post.id, record_type: 'Dummy::Post', action: 'create_to_many_relationships', payload: data[:params],
      user: user
    )
    expect(audit_log.present?).to eq(true)
  end

  it 'logs replace_to_many_relationships action' do
    comment = post.comments.create(text: 'Text')
    data = process_operations(
      'dummy/posts', 'update_relationship', user, {
        post_id: post.id, relationship: 'comments', data: [{ type: 'comments', id: comment.id }]
      }
    )
    audit_log = AuditLog.find_by(
      record_id: post.id, record_type: 'Dummy::Post', action: 'replace_to_many_relationships', payload: data[:params],
      user: user
    )
    expect(audit_log.present?).to eq(true)
  end

  it 'logs remove_to_many_relationships action' do
    comment = post.comments.create(text: 'Text')
    data = process_operations(
      'dummy/posts', 'destroy_relationship', user, {
        post_id: post.id, relationship: 'comments', data: [{ type: 'comments', id: comment.id }]
      }
    )

    audit_log = AuditLog.find_by(
      record_id: post.id, record_type: 'Dummy::Post', action: 'remove_to_many_relationships', payload: data[:params],
      user: user
    )
    expect(audit_log.present?).to eq(true)
  end

  it 'logs only if condition is true' do
    data = process_operations('dummy/author', 'index', user, { log: 'true' })

    audit_log = AuditLog.find_by(record_type: 'Dummy::Author', action: 'index', payload: data[:params], user: user)
    expect(audit_log.present?).to eq(true)
  end

  it "doesn't logs only if condition is false" do
    data = process_operations('dummy/author', 'index', user, { log: 'false' })

    audit_log = AuditLog.find_by(record_type: 'Dummy::Author', action: 'index', payload: data[:params], user: user)
    expect(audit_log.present?).to eq(false)
  end

  it 'lambda as payload option' do
    process_operations(
      'dummy/author', 'create', user, { data: { type: 'authors', attributes: { name: 'James' } } }
    )

    audit_log = AuditLog.find_by(
      record_type: 'Dummy::Author', action: 'create', payload: { user: user.id, attrs: { name: 'James' } },
      user: user
    )
    expect(audit_log.present?).to eq(true)
  end

  it 'symbol as payload option' do
    process_operations(
      'dummy/author', 'update', user, { data: { type: 'authors', id: author.id, attributes: { name: 'James' } } }
    )

    audit_log = AuditLog.find_by(
      record_type: 'Dummy::Author', action: 'update', user: user,
      payload: { user: user.id, updated_name: 'James', record_id: author.id }
    )
    expect(audit_log.present?).to eq(true)
  end

  it 'saves campaign, project, client, from passed parent_resource' do
    author.update_column(:campaign_id, campaign.id)
    process_operations('dummy/author', 'show', user, { id: author.id })
    audit_log = AuditLog.find_by(
      record_type: 'Dummy::Author', action: 'show', user: user,
      campaign_id: campaign.id, project_id: campaign.project_id, client: campaign.client.id
    )
    expect(audit_log.present?).to eq(true)
  end

  it 'saves campaign, project, client, from filters' do
    data = process_operations('dummy/author', 'index', user, { campaign_id_eq: campaign.id })

    audit_log = AuditLog.find_by(
      record_type: 'Dummy::Author', action: 'index', payload: data[:params], user: user,
      campaign_id: campaign.id, project_id: campaign.project_id, client: campaign.client.id
    )
    expect(audit_log.present?).to eq(false)
  end

  it 'saves campaign, client, project from request body' do
    allow(Pundit).to receive(:policy!).and_return(double(create?: true, update?: true))
    process_operations(
      'dummy/author', 'create', user, {
        data: { type: 'authors', attributes: { name: 'James' },
                relationships: { campaign: { data: { type: 'campaigns', id: campaign.id } } } }
      }
    )

    audit_log = AuditLog.find_by(
      record_type: 'Dummy::Author', action: 'create', user: user,
      campaign_id: campaign.id, project_id: campaign.project_id, client: campaign.client.id
    )
    expect(audit_log.present?).to eq(true)
  end

  it 'saves campaign, project, client from record' do
    allow(Pundit).to receive(:policy!).and_return(double(create?: true, update?: true))
    author.update_column(:campaign_id, campaign.id)
    process_operations(
      'dummy/author', 'update', user, {
        data: { type: 'authors', id: author.id, attributes: { name: 'James' } }
      }
    )

    audit_log = AuditLog.find_by(
      record_type: 'Dummy::Author', action: 'update', user: user,
      campaign_id: campaign.id, project_id: campaign.project_id, client: campaign.client.id
    )
    expect(audit_log.present?).to eq(true)
  end

  it "doesn't log if model validation fails" do
    allow(Pundit).to receive(:policy!).and_return(double(create?: true, update?: true))
    process_operations(
      'dummy/author', 'create', user, {
        data: { type: 'authors', attributes: { name: 'J' },
                relationships: { campaign: { data: { type: 'campaigns', id: campaign.id } } } }
      }
    )

    audit_log = AuditLog.find_by(
      record_type: 'Dummy::Author', action: 'create', user: user,
      campaign_id: campaign.id, project_id: campaign.project_id, client: campaign.client.id
    )
    expect(audit_log.present?).to eq(false)
  end

  def process_operations(controller, action, user, params = {})
    data = get_operations(controller, action, user, params)
    data[:results] = data[:operations].map(&:process)
    data
  end

  def get_operations(controller, action, user, params = {})
    params = ActionController::Parameters.new(
      params.merge(controller: controller, action: action)
    )
    data = { params: params }
    data[:operations] = JSONAPI::RequestParser.new(
      params, context: { user: user, params: params }
    ).operations
    data
  end
end
