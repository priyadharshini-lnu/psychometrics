---
applyTo: '**'
---
## Resources

1.  [JSON:API Specification](https://jsonapi.org/)
2.  [JSON Resource Gem](https://jsonapi-resources.com/) Provides controller with CRUD operations and provide Serialization which adheres to JSON:API Specification
3. [JSON Utils Gem](https://github.com/tiagopog/jsonapi-utils) If we ever have to create actions which calls command
4.  [Dry Schema Gem](https://dry-rb.org/gems/dry-schema/1.5/): Defines request body schema
5.  [Dry Validation Gem](https://dry-rb.org/gems/dry-validation/1.8): Defines validation contract for custom validations

## Steps to add endpoint for a resource

### 1.  Creating Routes
```ruby
jsonapi_resources :clients
```
Above code will create all the crud endpoints for Post resource
If we want to create nested routes you can use any of the method from [documentation](https://jsonapi-resources.com/v0.10/guide/routing.html#Nested-Routes)

Example:
```ruby
jsonapi_resources :clients do
  jsonapi_relationships
end
```

### 2. Adding Schema/Contract
```ruby
class Api::V2::Client::Schema < Api::Base::Schema
  def self.resource
    'clients'
  end

  def self.attributes(attribute, type)
    proc do
      attribute[:name].filled(:string)
      attribute[:number].filled(:string)
    end
  end

  def self.relationships(_)
    [
      { name: :project_manager, resource: :users, relationship: :one }
    ]
  end

  def self.extra_index_meta_schema
    proc do
      required(:countries).array(:str?)
    end
  end 
end
```
Schemas and Contract are created inside `app/types` folder. All Schemas inherit from the Api::Base::Schema.
Above schema will give 6 class methods which would have different schemas for each action 
- create_request: Request body schema for create action
- update_request: Request body schema for update action
- create_relationship_request: Request body schema for creating relationship for the resource
- update_relationship_request: Request body schema for updating relationship for the resource
- single_response: Response schema for show action. This is just used for generating json schema for swagger docs.
- multiple_response: Response schema from index action. This is just used for generating json schema for swagger docs.

Schemas class can define these 4 class methods
- resource: This method should return the JSON:API resource name.
- attributes: This method is used for defining all the attributes that the request body or response will have. Attributes are defined using dry-schemas. First argument to `attributes` method is called `attribute` which is either `required` or `optional` method from the dry-schema. It will be `required` method for create schema and `optional` method for update schema. All attributes are optional in update request body.
Second argument `type` can be any of therse symbols, :create, :update, :single_response, multiple_response which corresponds to create, update, show and index action respectively. `type` argument can be used to define attribute conditionaly. 
Example below
    ```ruby
    # we don't want to send `number` attribute with index action but it needs to be sent with show action
    def self.attributes(attribute, type)
      proc do
        attribute[:name].filled(:string)
        if type != :multiple_response
          attribute[:number].filled(:string)
        end
      end
    end
    ```
 - relationships: We can define a resource relationship inside this method. This method should return a array of hash defining the relationship. Each relationship hash can have following keys
    - name(symbol): name of the relationship.
    - resource(symbol): type of the resource
    - relationship(symbol): Either `one` or `many` depending on whether it is has_one/belongs_to or has_many type of relationship
    - required(boolean): If this relationship is mandatory or not in the request body. If required we would have to pass this relationship name as a key inside relationships hash in the request body. By default required is true for 'one' relationship and false for 'many'.
    - links(boolean): Specifies whether self and related links be defined in the schema or not. By default it will be true for single_reponse/show and multiple_response/index schema wil
    - allowed_blank(boolean): Specifies whether we can pass `null` for relationship i.e remove relationship. Only useful for update request, if we want update action to not remove relationship.
- extra_index_meta_schema: Defines schema for meta for index action
    
### 3. Adding controller
```ruby
class Api::V2::ClientsController < Api::V2::Administration::BaseController
 validate_crud_requests Api::V2::Client::Schema
end
```
Api::V2::Administration::BaseController has logic for authenticating API flow with Basic HTTP authentication and also with cookie based authetication. It also has the code to validate the request body against schema.
`validate_crud_requests` method takes a Schema class defined in the step 2 to validate the request body. If request body doesn't adhers to the schema it will send status 422 with a error message to the client.

All controller action needs to be authorized else exception would be thrown. By default all action are authorized using `Api::V2::Administration::BaseController#pundit_authorize` method.
`campaign_id` from the params is passed to the policy if it's present in the url or if `campaign_id` method is defined in the controller it is passed to the authorize method. Same with `project_id`.

If default authorization provided by BaseController doesn't work for particular case, just override define `pundit_authorize` method in the controller to perform authorization.

### 4. Adding JSONAPI::Resource
```ruby
class Api::V2::Administration::ClientResource < Api::V2::Administration::BaseResource
 attribute :name, :type
 
 has_one :account_manager
 ransack_filters %i[name_cont name_eq]
end
```
Inside JSONAPI::Resource class all attribute and relationship that will be serialized and sent as a response is mentioned.
Api::V2::Administration::BaseResource has model hints for the cases where resource name cannot be deduced based on the model name (mostly in case of Single table inheritence)
`ransack_filters` is a custom method through which we can specify what all ranscack generated filters that can be used.

### 5. Adding Policy class
```ruby
class Api::Administration::ClientPolicy < ::Administration::ClientPolicy
  class Scope < Scope
    def resolve
      ::Administration::ClientPolicy::Scope.new(user, Client).resolve.tenancies
    end
  end
end
```
New Policy classes will only be created for new API version on the need bases. By default all API version will use the same Policy class (namespace is Api::Administration::ClientPolicy and not Api::V2::Administration::ClientPolicy). API policy classes will inherit from exicting API classes and would only define additional methods if required. Policy scope class will also inherit from the existing Policy Scope class

### 6. Generating Swagger schema
To generate swagger schema use `Api::Base::GenerateSwagger` class.
Example:
```ruby
# Generate response JSON schema for response returned from ClientsController#show action
Api::Base::GenerateSwagger.call!(Api::V2::Client::Schema.single_resource_response)

# Generate request body JSON schema for ClientsController#create action
Api::Base::GenerateSwagger.call!(Api::V2::Client::Schema.create_request)
```

To check all the JSON schema for V2 api, check To check `spec/swagger/v2/schema.rb` file

### 7. Adding Spec with required relationship
Example:
```ruby
def self.relationships(_)
 [
  { name: :owner, resource: :clients, relationship: :one, required: false, allowed_blank: true },
  { name: :report, resource: :reports, relationship: :one, required: true, allowed_blank: false },
  { name: :assessment, resource: :assessments, relationship: :one, required: true, allowed_blank: false }
 ]
end
```
To handle error like 
`Expected response body to match schema: The property '#/data/0/relationships/report' did not contain a required property of 'self' in schema 1750f986-aa48-5204-b892-4c19742b18e7#`

We need to add following code in the schema
```ruby
def self.links?
 false
end
```
check following `app/types/api/v2/campaign_template/schema.rb` file for more understanding.
